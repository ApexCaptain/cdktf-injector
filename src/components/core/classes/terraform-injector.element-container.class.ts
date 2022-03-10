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
  TerraformInjectorBackendClassType,
  TerraformInjectorConfigureCallbackAsyncType,
  TerraformInjectorConfigureCallbackType,
  TerraformInjectorConfigAndSharedObjectType,
  TerraformInjectorElementContainerUninitializedError,
  TerraformInjectorElementContainerAsync,
  TerraformInjectorClass,
} from '../../../module';

export class TerraformInjectorElementContainerClass<
  TerraformElementType extends TerraformElement,
  ConfigType,
  SharedType,
> implements
    TerraformInjectorElementContainerAsync<TerraformElementType, SharedType>
{
  // Properties
  // Production

  // Hidden
  name: string;
  dependencies = new Set<
    TerraformInjectorElementContainerClass<any, any, any>
  >();
  dependents = new Set<TerraformInjectorElementContainerClass<any, any, any>>();
  retryCount = 1;
  isInitialized = false;
  terraformElementContainerNonInitializedError: TerraformInjectorElementContainerUninitializedError;
  afterInitElementCallbackArray = new Array<
    (element: TerraformElementType, shared: SharedType) => void | Promise<void>
  >();
  afterDependenciesInjectedCallbackArray = new Array<
    (element: TerraformElementType, shared: SharedType) => void | Promise<void>
  >();

  // Getters
  _shared!: SharedType;
  _element!: TerraformElementType;
  get shared(): SharedType {
    if (!this.isInitialized)
      throw this.terraformElementContainerNonInitializedError;
    return this._shared;
  }

  get element(): TerraformElementType {
    if (!this.isInitialized)
      throw this.terraformElementContainerNonInitializedError;
    return this._element;
  }

  // Constructor
  constructor(
    public scope: Construct,
    public terraformElementClass:
      | TerraformInjectorElementClassType<TerraformElementType, ConfigType>
      | TerraformInjectorBackendClassType<TerraformElementType, ConfigType>,
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
    this.afterInitElementCallbackArray.push(afterInitCallback);
    return this;
  }

  afterDependenciesInjected(
    afterDependenciesInjectedCallback: (
      element: TerraformElementType,
      shared: SharedType,
    ) => void | Promise<void>,
  ) {
    this.afterDependenciesInjectedCallbackArray.push(
      afterDependenciesInjectedCallback,
    );
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
  inject(): TerraformInjectorElementContainerClass<any, any, any> | void {
    try {
      if (!this.isInitialized)
        this.initialize(
          (
            this.configure as TerraformInjectorConfigureCallbackType<
              ConfigType,
              SharedType
            >
          )(),
        );
      for (const eachAfterInitCallback of this.afterInitElementCallbackArray) {
        void eachAfterInitCallback(this.element, this.shared);
      }
    } catch (error) {
      if (
        error instanceof TerraformInjectorElementContainerUninitializedError
      ) {
        const dependencyContainer = error.container;
        this.dependencies.add(dependencyContainer);
        dependencyContainer.dependents.add(this);
        return dependencyContainer;
      } else throw error;
    }
  }
  async injectAsync(): Promise<TerraformInjectorElementContainerClass<
    any,
    any,
    any
  > | void> {
    try {
      if (!this.isInitialized)
        this.initialize(
          await (
            this.configure as TerraformInjectorConfigureCallbackAsyncType<
              ConfigType,
              SharedType
            >
          )(),
        );
      for (const eachAfterInitCallback of this.afterInitElementCallbackArray) {
        await eachAfterInitCallback(this.element, this.shared);
      }
    } catch (error) {
      if (
        error instanceof TerraformInjectorElementContainerUninitializedError
      ) {
        const dependencyContainer = error.container;
        this.dependencies.add(dependencyContainer);
        dependencyContainer.dependents.add(this);
        return dependencyContainer;
      } else throw error;
    }
  }
  private initialize(
    configAndSharedObject: TerraformInjectorConfigAndSharedObjectType<
      ConfigType,
      SharedType
    >,
  ) {
    let config: ConfigType;
    if (Array.isArray(configAndSharedObject)) {
      config = configAndSharedObject[0];
      this._shared = configAndSharedObject[1];
    } else config = configAndSharedObject;
    if (
      this.useDefaultConfig &&
      !(this.terraformElementClass.prototype instanceof TerraformOutput)
    )
      config = _.merge(
        this.injector.defaultConfigure(
          this.id,
          this.terraformElementClass.name,
          this.description,
        ),
        config,
      );
    this._element =
      this.terraformElementClass.prototype instanceof TerraformBackend
        ? new (this.terraformElementClass as TerraformInjectorBackendClassType<
            TerraformElementType,
            ConfigType
          >)(this.scope, config)
        : new (this.terraformElementClass as TerraformInjectorElementClassType<
            TerraformElementType,
            ConfigType
          >)(this.scope, this.id, config);
    this.isInitialized = true;
  }
}
