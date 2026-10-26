import {
  TerraformBackend,
  TerraformElement,
  TerraformOutput,
  TerraformOutputConfig,
} from 'cdktf';
import { Construct } from 'constructs';
import _ from 'lodash';
import {
  TerraformInjectorElementClassType,
  TerraformInjectorElementClassWithoutIdType,
  TerraformInjectorConfigureCallbackAsyncType,
  TerraformInjectorConfigureCallbackType,
  TerraformInjectorConfigAndSharedObjectType,
  TerraformInjectorElementContainerUninitializedError,
  TerraformInjectorElementContainerAsync,
  TerraformInjectorClass,
  TerraformInjectorConflictedInjectingMethodTypeError,
} from '../../../module';

/**
 * Deep-merges `override` onto `defaults` without mutating either.
 * Arrays are replaced, not concatenated, so a user-supplied array always wins as a whole.
 */
const mergeElementConfig = <T>(
  defaults: Record<string, unknown>,
  override: T,
): T =>
  _.mergeWith(
    {},
    defaults,
    override,
    (_objValue: unknown, srcValue: unknown) =>
      Array.isArray(srcValue) ? srcValue : undefined,
  ) as T;

const isPromiseLike = (value: unknown): value is PromiseLike<unknown> =>
  typeof (value as PromiseLike<unknown> | undefined)?.then === 'function';

/** Prototype-chain check on the class itself, since no instance exists yet. */
const isClassOrSubclass = (
  elementClass: unknown,
  base: abstract new (...args: never[]) => object,
): boolean =>
  elementClass === base ||
  (typeof elementClass === 'function' &&
    (elementClass as { prototype: object }).prototype instanceof base);

/**
 * Implementation behind `TerraformInjectorElementContainer` and
 * `TerraformInjectorElementContainerAsync`. Holds a configure callback until
 * injection, then instantiates and keeps the element.
 */
export class TerraformInjectorElementContainerClass<
  TerraformElementType extends TerraformElement,
  ConfigType,
  SharedType,
> implements TerraformInjectorElementContainerAsync<
  TerraformElementType,
  SharedType
> {
  // Properties
  // Production

  // Hidden
  /** Display name, `<ClassName id>`, used in error messages. */
  name: string;
  /** Containers this one was found to read during configure. Bookkeeping only. */
  dependencies = new Set<
    TerraformInjectorElementContainerClass<any, any, any>
  >();
  dependents = new Set<TerraformInjectorElementContainerClass<any, any, any>>();
  isInitialized = false;
  /** Set once `onNewElementInjected` callbacks have run for this element. */
  isNewElementNotified = false;
  /**
   * Thrown by the `element` / `shared` getters before initialization. It carries this
   * container, which is how `commitInjection` learns what a dependent is waiting for.
   */
  terraformElementContainerNonInitializedError: TerraformInjectorElementContainerUninitializedError;
  // `isCalled` keeps each callback to a single run across repeated injection passes.
  afterInitElementCallbackContainerArray = new Array<{
    isCalled: boolean;
    callback: (
      element: TerraformElementType,
      shared: SharedType,
    ) => void | Promise<void>;
  }>();
  afterDependenciesInjectedCallbackContainerArray = new Array<{
    isCalled: boolean;
    callback: (
      element: TerraformElementType,
      shared: SharedType,
    ) => void | Promise<void>;
  }>();

  // Getters
  /** An `afterInitElement` callback that has not run yet, e.g. one registered after injection. */
  get hasPendingAfterInitCallback(): boolean {
    return this.afterInitElementCallbackContainerArray.some(
      (eachCallbackContainer) => !eachCallbackContainer.isCalled,
    );
  }
  /** Initialized and every `afterInitElement` callback has run. */
  get isSettled(): boolean {
    return this.isInitialized && !this.hasPendingAfterInitCallback;
  }
  _shared!: SharedType;
  _element!: TerraformElementType;
  get shared(): SharedType {
    if (!this.isInitialized) {
      throw this.terraformElementContainerNonInitializedError;
    }
    return this._shared;
  }

  get element(): TerraformElementType {
    if (!this.isInitialized) {
      throw this.terraformElementContainerNonInitializedError;
    }
    return this._element;
  }

  // Constructor
  constructor(
    public scope: Construct,
    public terraformElementClass:
      | TerraformInjectorElementClassType<TerraformElementType, ConfigType>
      | TerraformInjectorElementClassWithoutIdType<
          TerraformElementType,
          ConfigType
        >,
    public id: string,
    public configure:
      | TerraformInjectorConfigureCallbackType<ConfigType, SharedType>
      | TerraformInjectorConfigureCallbackAsyncType<ConfigType, SharedType>,
    public injector: TerraformInjectorClass,
    public caller: string,
    public useDefaultConfig: boolean,
    public description?: string,
  ) {
    this.name = `<${terraformElementClass.name} ${id}>`;
    this.terraformElementContainerNonInitializedError =
      new TerraformInjectorElementContainerUninitializedError(
        `Terraform element ${this.name} is not initialized. You have to call <your injector>.inject or injectAsync first.`,
        this,
      );
  }

  // Methods
  // Production
  toString(): string {
    return JSON.stringify(
      {
        'Element Type': this.terraformElementClass.name,
        'Scope Path': `${this.scope.node.path}/${this.id}`,
        'Created at': this.caller,
      },
      null,
      2,
    );
  }

  afterInitElement(
    afterInitCallback: (
      element: TerraformElementType,
      shared: SharedType,
    ) => void | Promise<void>,
  ) {
    this.afterInitElementCallbackContainerArray.push({
      isCalled: false,
      callback: afterInitCallback,
    });
    return this;
  }

  afterDependenciesInjected(
    afterDependenciesInjectedCallback: (
      element: TerraformElementType,
      shared: SharedType,
    ) => void | Promise<void>,
  ) {
    this.afterDependenciesInjectedCallbackContainerArray.push({
      isCalled: false,
      callback: afterDependenciesInjectedCallback,
    });
    return this;
  }

  addOutput(
    outputId: string | ((elementId: string) => string),
    outputConfig: (
      element: TerraformElementType,
      shared: SharedType,
    ) => TerraformOutputConfig,
  ) {
    this.injector.provide(
      TerraformOutput,
      typeof outputId === 'string' ? outputId : outputId(this.id),
      () => outputConfig(this.element, this.shared),
    );
    return this;
  }

  // Hidden
  /**
   * Tries to initialize the element, then runs pending `afterInitElement` callbacks.
   *
   * @param upperInjectors Injectors from the root down to this container's scope, for default configs.
   * @returns The uninitialized container that configure (or a callback) tried to read, or
   * nothing when this container is done. A returned container means "inject that first, then retry me".
   */
  inject(
    upperInjectors: Array<TerraformInjectorClass>,
  ): TerraformInjectorElementContainerClass<any, any, any> | void {
    try {
      if (!this.isInitialized) {
        this.initialize(
          this.throwIfPromise(
            (
              this.configure as TerraformInjectorConfigureCallbackType<
                ConfigType,
                SharedType
              >
            )(this.id),
            'configure',
          ),
          upperInjectors,
        );
      }
      for (const eachAfterInitCallbackContainer of this
        .afterInitElementCallbackContainerArray) {
        if (!eachAfterInitCallbackContainer.isCalled) {
          void this.throwIfPromise(
            eachAfterInitCallbackContainer.callback(this.element, this.shared),
            'afterInitElement',
          );
          eachAfterInitCallbackContainer.isCalled = true;
        }
      }
    } catch (error) {
      if (
        error instanceof TerraformInjectorElementContainerUninitializedError
      ) {
        const dependencyContainer = error.container;
        this.dependencies.add(dependencyContainer);
        dependencyContainer.dependents.add(this);
        return dependencyContainer;
      } else {
        throw error;
      }
    }
  }
  /** Async variant of `inject`: awaits configure and `afterInitElement` callbacks. */
  async injectAsync(
    upperInjectors: Array<TerraformInjectorClass>,
  ): Promise<TerraformInjectorElementContainerClass<any, any, any> | void> {
    try {
      if (!this.isInitialized) {
        this.initialize(
          await (
            this.configure as TerraformInjectorConfigureCallbackAsyncType<
              ConfigType,
              SharedType
            >
          )(this.id),
          upperInjectors,
        );
      }
      for (const eachAfterInitCallbackContainer of this
        .afterInitElementCallbackContainerArray) {
        if (!eachAfterInitCallbackContainer.isCalled) {
          await eachAfterInitCallbackContainer.callback(
            this.element,
            this.shared,
          );
          eachAfterInitCallbackContainer.isCalled = true;
        }
      }
    } catch (error) {
      if (
        error instanceof TerraformInjectorElementContainerUninitializedError
      ) {
        const dependencyContainer = error.container;
        this.dependencies.add(dependencyContainer);
        dependencyContainer.dependents.add(this);
        return dependencyContainer;
      } else {
        throw error;
      }
    }
  }
  /**
   * A sync injector cannot await, so a Promise from a user callback would run detached:
   * its work lands after `inject()` returns and a rejection crashes the process. Reject it
   * up front instead. The Promise gets a no-op handler so it cannot become an unhandled rejection.
   */
  throwIfPromise<T>(value: T, callbackName: string): T {
    if (isPromiseLike(value)) {
      Promise.resolve(value).catch(() => undefined);
      throw new TerraformInjectorConflictedInjectingMethodTypeError(
        `${callbackName} of ${this.name} returned a Promise, but the injector on <${this.injector.scope.node.path}> is synchronous. Make the callback synchronous, or use TerraformInjectorFactory.scopesOnAsync / TerraformInjectorStackAsync.`,
      );
    }
    return value;
  }
  /**
   * Splits `[config, shared]`, merges default configs (root first, so the closest scope
   * wins and the user config wins over all), then constructs the element.
   * `TerraformOutput` never takes defaults.
   */
  private initialize(
    configAndSharedObject: TerraformInjectorConfigAndSharedObjectType<
      ConfigType,
      SharedType
    >,
    upperInjectors: Array<TerraformInjectorClass>,
  ) {
    let config: ConfigType;
    if (Array.isArray(configAndSharedObject)) {
      config = configAndSharedObject[0];
      this._shared = configAndSharedObject[1];
    } else {
      config = configAndSharedObject;
    }
    if (
      this.useDefaultConfig &&
      !isClassOrSubclass(this.terraformElementClass, TerraformOutput)
    ) {
      let defaults: Record<string, unknown> = {};
      for (const eachInjector of upperInjectors) {
        if (eachInjector.defaultConfigure) {
          defaults = mergeElementConfig(
            defaults,
            eachInjector.defaultConfigure(
              this.id,
              this.terraformElementClass.name,
              this.description,
            ),
          );
        }
      }
      config = mergeElementConfig(defaults, config);
    }
    // A backend takes (scope, config); every other element takes (scope, id, config).
    this._element = isClassOrSubclass(
      this.terraformElementClass,
      TerraformBackend,
    )
      ? new (
          this
            .terraformElementClass as TerraformInjectorElementClassWithoutIdType<
            TerraformElementType,
            ConfigType
          >
        )(this.scope, config)
      : new (
          this.terraformElementClass as TerraformInjectorElementClassType<
            TerraformElementType,
            ConfigType
          >
        )(this.scope, this.id, config);
    this.isInitialized = true;
  }
}
