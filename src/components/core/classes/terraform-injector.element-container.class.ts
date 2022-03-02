import { TerraformElement, TerraformOutputConfig } from 'cdktf';
import { Construct } from 'constructs';
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
    public description?: string,
  ) {
    this.name = `<${terraformElementClass.name} ${id}>`;
    this.terraformElementContainerNonInitializedError =
      new TerraformInjectorElementContainerUninitializedError(
        `Terraform element ${this.name} is not initialized. You have to call <yout injector>.inject or injectAsync first.`,
        this,
      );
  }

  // Methods
  // Production
  toString(): string {
    return JSON.stringify({
      name: this.name,
      id: this.id,
      element: this.terraformElementClass.name,
      scope: this.scope.toString(),
    });
  }

  addOutput(
    outputId: string | ((elementId: string) => string | Promise<string>),
    outputConfig: (
      element: TerraformElementType,
      shared: SharedType,
    ) => TerraformOutputConfig | Promise<TerraformOutputConfig>,
  ) {
    outputId;
    outputConfig;
    return this;
  }

  // Hidden
  inject(): TerraformInjectorElementContainerClass<any, any, any> | void {
    try {
      this.initialize(
        (
          this.configure as TerraformInjectorConfigureCallbackType<
            ConfigType,
            SharedType
          >
        )(),
      );
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
      this.initialize(
        await (
          this.configure as TerraformInjectorConfigureCallbackAsyncType<
            ConfigType,
            SharedType
          >
        )(),
      );
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
    if ('shared' in configAndSharedObject) {
      this._shared = configAndSharedObject.shared;
      config = configAndSharedObject.config;
    } else {
      this._shared = {} as SharedType;
      config = configAndSharedObject;
    }
    this._element =
      this.id == 'backend'
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
