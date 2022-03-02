import { TerraformBackend, TerraformElement } from 'cdktf';
import { Construct } from 'constructs';
import {
  TerraformInjectorCommon,
  TerraformInjectorElementContainerClass,
  TerraformInjectorConfigureCallbackType,
  TerraformInjectorConfigureCallbackAsyncType,
  TerraformInjectorElementContainerAsync,
  TerraformInjectorElementClassType,
  TerraformInjectorBackendClassType,
  TerraformInjectorConflictedElementIdError,
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
    SharedType = {},
  >(
    terraformBackendClass: TerraformInjectorBackendClassType<
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
      description,
    );
    this.elementMap.set(id, backendContainer);
    return backendContainer;
  }
  provide<
    TerraformElementType extends TerraformElement,
    ConfigType,
    SharedType = {},
  >(
    terraformElementClass: TerraformInjectorElementClassType<
      TerraformElementType,
      ConfigType
    >,
    id: string,
    configure:
      | TerraformInjectorConfigureCallbackType<ConfigType, SharedType>
      | TerraformInjectorConfigureCallbackAsyncType<ConfigType, SharedType>,
    description?: string,
  ): TerraformInjectorElementContainerAsync<TerraformElementType, SharedType> {
    if (id == 'backend')
      throw new TerraformInjectorConflictedElementIdError(
        `id : ${id} is not allowed for non-bakend class`,
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
      description,
    );
    this.elementMap.set(id, elementContainer);
    return elementContainer;
  }
  // Hidden
  inject(): void | Promise<void> {
    return commitInjection(this);
  }
  get isinjected() {
    const containers = Array.from(this.elementMap.values());
    return containers.length == 0
      ? true
      : containers.every((eachContainer) => eachContainer.isInitialized);
  }
}
