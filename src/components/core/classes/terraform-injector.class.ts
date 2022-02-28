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
  TerraformInjectorElementContainerDependencyCycleError,
  TerraformInjectorElementContainerSelfDependenceError,
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
    commitInjection(this);
    /*
    const elementContainers = Array.from(this.elementMap.values());
    const cycleContainerDependencyStack = new Array<
      TerraformInjectorElementContainerClass<any, any, any>
    >();
    const cycleContainerDependencyIdSet = new Set<string>();
    if (this.useAsync) {
      return new Promise(async (resolve, reject) => {
        try {
        } catch (error) {
          reject(error);
        }
        resolve();
      });
    } else {
      for (const eachContainer of elementContainers) {
        if (eachContainer.isInitialized) continue;
        cycleContainerDependencyStack.push(eachContainer);
        cycleContainerDependencyIdSet.add(eachContainer.id);
        while (cycleContainerDependencyStack.length) {
          const topContainer = cycleContainerDependencyStack.pop()!;
          cycleContainerDependencyIdSet.delete(topContainer.id);
          const newDependencyContainer = topContainer.inject();
          if (newDependencyContainer) {
            if (topContainer.id == newDependencyContainer.id) {
              throw new TerraformInjectorElementContainerSelfDependenceError(
                `${topContainer.name} is self-dependence. You cannot use its own element when you configure the container.`,
              );
            }
            cycleContainerDependencyStack.push(topContainer);
            cycleContainerDependencyIdSet.add(topContainer.id);
            if (cycleContainerDependencyIdSet.has(newDependencyContainer.id)) {
              throw new TerraformInjectorElementContainerDependencyCycleError(
                cycleContainerDependencyStack.slice(
                  cycleContainerDependencyStack.indexOf(newDependencyContainer),
                ),
              );
            }
            cycleContainerDependencyStack.push(newDependencyContainer);
            cycleContainerDependencyIdSet.add(newDependencyContainer.id);
          } else continue;
        }
      }
    }
    */
  }
}
