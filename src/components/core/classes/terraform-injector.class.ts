import { TerraformBackend, TerraformElement } from 'cdktf';
import { Construct } from 'constructs';
import {
  TerraformInjectorCommon,
  TerraformInjectorElementContainerClass,
  TerraformInjectorConfigureCallbackType,
  TerraformInjectorConfigureCallbackAsyncType,
  TerraformInjectorElementContainer,
  TerraformInjectorElementContainerAsync,
  TerraformInjectorElementClassType,
  TerraformInjectorElementClassWithoutIdType,
  TerraformInjectorConflictedElementIdError,
  TerraformLazyElement,
  TerraformLazyElementAsync,
  TerraformInjectorNestedConfigureCallbackType,
  TerraformInjectorNestedConfigureCallbackAsyncType,
  TerraformLazyElementNestedConfig,
  TerraformLazyElementNestedConfigAsync,
  getCaller,
  commitInjection,
} from '../../../module';

export class TerraformInjectorClass implements TerraformInjectorCommon {
  // Properties
  // Production
  // Hidden
  elementMap = new Map<
    string,
    TerraformInjectorElementContainerClass<any, any, any>
  >();
  _defaultConfigure?: (
    id: string,
    className: string,
    description?: string,
  ) => {
    [x: string]: any;
  };
  onNewElementInjectedCallbackArray = new Array<
    (element: TerraformElement) => void
  >();
  get defaultConfigure() {
    return this._defaultConfigure;
  }
  // Getters
  // Constructor
  constructor(
    public scope: Construct,
    public useAsync: boolean,
    public caller: string,
    public description?: string,
  ) {}

  // Methods
  // Production
  toString(): string {
    return JSON.stringify(
      {
        'Scope Path': `${this.scope.node.path}`,
        'Created at': this.caller,
      },
      null,
      2,
    );
  }
  backend<
    TerraformBackendType extends TerraformBackend,
    PropsType,
    SharedType = undefined,
  >(
    terraformBackendClass: TerraformInjectorElementClassWithoutIdType<
      TerraformBackendType,
      PropsType
    >,
    configure:
      | TerraformInjectorConfigureCallbackType<PropsType, SharedType>
      | TerraformInjectorConfigureCallbackAsyncType<PropsType, SharedType>,
    description?: string,
  ): TerraformInjectorElementContainerAsync<TerraformBackendType, SharedType> {
    const id = 'backend';
    if (this.elementMap.has(id))
      throw new TerraformInjectorConflictedElementIdError(
        `Element id "${id}" already exists in scope "${this.scope}". Element type : "${terraformBackendClass.name}"`,
      );
    const backendContainer = new TerraformInjectorElementContainerClass(
      this.scope,
      terraformBackendClass,
      id,
      configure,
      this,
      getCaller(),
      false,
      description,
    );
    this.elementMap.set(id, backendContainer);
    return backendContainer;
  }
  provide<
    TerraformElementType extends TerraformElement,
    ConfigType,
    SharedType = undefined,
  >(
    terraformElementClass: TerraformInjectorElementClassType<
      TerraformElementType,
      ConfigType
    >,
    id: string,
    configure:
      | TerraformInjectorConfigureCallbackType<ConfigType, SharedType>
      | TerraformInjectorConfigureCallbackAsyncType<ConfigType, SharedType>,
    useDefaultConfig: boolean = true,
    description?: string,
  ): TerraformInjectorElementContainerAsync<TerraformElementType, SharedType> {
    if (id == 'backend')
      throw new TerraformInjectorConflictedElementIdError(
        `id : ${id} is not allowed for non-backend class`,
      );
    if (this.elementMap.has(id))
      throw new TerraformInjectorConflictedElementIdError(
        `Element id "${id}" already exists in scope "${this.scope}". Element type : "${terraformElementClass.name}"`,
      );
    const elementContainer = new TerraformInjectorElementContainerClass(
      this.scope,
      terraformElementClass,
      id,
      configure,
      this,
      getCaller(),
      useDefaultConfig,
      description,
    );
    this.elementMap.set(id, elementContainer);
    return elementContainer;
  }

  provideLazily<
    NestedTerraformElementType extends TerraformElement,
    NestedConfigType,
    NestedSharedType = undefined,
    SharedType = undefined,
  >(
    nestedTerraformElementClass: TerraformInjectorElementClassType<
      NestedTerraformElementType,
      NestedConfigType
    >,
    id: string,
    configure:
      | TerraformInjectorNestedConfigureCallbackAsyncType<
          NestedConfigType,
          NestedSharedType,
          SharedType
        >
      | TerraformInjectorNestedConfigureCallbackType<
          NestedConfigType,
          NestedSharedType,
          SharedType
        >,
    useDefaultConfig: boolean = true,
    description?: string,
  ):
    | TerraformInjectorElementContainerAsync<
        TerraformLazyElementAsync<
          NestedTerraformElementType,
          NestedConfigType,
          NestedSharedType
        >,
        SharedType
      >
    | TerraformInjectorElementContainer<
        TerraformLazyElement<
          NestedTerraformElementType,
          NestedConfigType,
          NestedSharedType
        >,
        SharedType
      > {
    if (id == 'backend')
      throw new TerraformInjectorConflictedElementIdError(
        `id : ${id} is not allowed for non-backend class`,
      );
    if (this.elementMap.has(id))
      throw new TerraformInjectorConflictedElementIdError(
        `Element id "${id}" already exists in scope "${
          this.scope
        }". Element type : "${
          this.useAsync
            ? TerraformLazyElementAsync.name
            : TerraformLazyElement.name
        }"`,
      );
    const elementContainer = new TerraformInjectorElementContainerClass(
      this.scope,
      this.useAsync ? TerraformLazyElementAsync : TerraformLazyElement,
      id,
      (parentId) => {
        const configureResult = configure(parentId);
        let shared: SharedType | undefined = undefined;
        let config: Array<
          | TerraformLazyElementNestedConfig<NestedConfigType, NestedSharedType>
          | TerraformLazyElementNestedConfigAsync<
              NestedConfigType,
              NestedSharedType
            >
        >;
        if (Array.isArray(configureResult[0])) {
          shared = configureResult[1] as SharedType;
          config = configureResult[0];
        } else config = configureResult as any;
        return [
          {
            nestedTerraformElementClass: nestedTerraformElementClass,
            injector: this,
            nestedConfigure: config,
          },
          shared,
        ] as any;
      },
      this,
      getCaller(),
      useDefaultConfig,
      description,
    );
    this.elementMap.set(id, elementContainer);
    return elementContainer as any;
  }

  setDefaultConfigure(
    defaultConfigure: (
      id: string,
      className: string,
      description?: string,
    ) => { [x: string]: any },
  ): TerraformInjectorClass {
    this._defaultConfigure = defaultConfigure;
    return this;
  }

  onNewElementInjected(
    onNewElementInjectedCallback: (element: TerraformElement) => void,
  ): TerraformInjectorClass {
    this.onNewElementInjectedCallbackArray.push(onNewElementInjectedCallback);
    return this;
  }

  inject(): void | Promise<void> {
    return commitInjection(this);
  }
  // Hidden
  get isInjected() {
    const containers = Array.from(this.elementMap.values());
    return containers.length == 0
      ? true
      : containers.every((eachContainer) => eachContainer.isInitialized);
  }
}
