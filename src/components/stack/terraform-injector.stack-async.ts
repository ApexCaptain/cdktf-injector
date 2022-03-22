import { TerraformStack, TerraformBackend, TerraformElement } from 'cdktf';
import { Construct } from 'constructs';
import {
  TerraformInjectorFactory,
  TerraformInjectorAsync,
  getCaller,
  TerraformInjectorClass,
  TerraformInjectorElementContainerAsync,
  TerraformInjectorElementClassWithoutIdType,
  TerraformInjectorConfigureCallbackType,
  TerraformInjectorConfigureCallbackAsyncType,
  TerraformInjectorElementClassType,
} from '../../module';
import { TerraformInjectorNestedConfigureCallbackAsyncType } from '../core';
import { TerraformLazyElementAsync } from '../resource';

/**
 * Stack class extends ```TerraformStack``` and implementing {@link TerraformInjectorAsync}.
 */
export class TerraformInjectorStackAsync
  extends TerraformStack
  implements TerraformInjectorAsync
{
  private injector;
  constructor(
    scope: Construct,
    name: string,
    injectorDescription: string = `Async-Injector of <${
      TerraformInjectorStackAsync.name
    }> created at (${getCaller(1)})`,
  ) {
    super(scope, name);
    this.injector = TerraformInjectorFactory.scopesOnAsync(
      this,
      injectorDescription,
    );
    (this.injector as TerraformInjectorClass).caller = getCaller(1);
  }
  /**
   * Set backend of the injector. You cannot provide multiple backend elements to the injector and only one backend
   * could be provided for one stack each.
   *
   * @see https://www.terraform.io/cdktf/concepts/remote-backends
   *
   * @param terraformBackendClass Remote backend class to instantiate.
   *
   * @param configure Configuration callbak for certain backend class.
   *
   * @param description Optional description string.
   */
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
    return this.injector.backend(terraformBackendClass, configure, description);
  }

  /**
   * Provide an element to the injector.
   *
   * @see https://www.terraform.io/cdktf/concepts/providers-and-resources
   *
   * @param terraformElementClass Terraform element class to instantiate.
   *
   * @param id The scoped construct ID. Must be unique amongst siblings in the same scope.
   *
   * @param configure Configuration callbak for certain element class.
   *
   * @param useDefaultConfig Set false to ignore default config of the injector. Default is true.
   *
   * @param description Optional description string.
   */
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
    return this.injector.provide(
      terraformElementClass,
      id,
      configure,
      useDefaultConfig,
      description,
    );
  }

  /**
   * Lazily provide elements to the injector.
   *
   * @see https://www.terraform.io/cdktf/concepts/providers-and-resources
   *
   * @param nestedTerraformElementClass Terraform element class to instantiate.
   *
   * @param id The scoped construct ID. Must be unique amongst siblings in the same scope.
   *
   * @param configure Configuration callbak for certain element class.
   *
   * @param useDefaultConfig Set false to ignore default config of the injector. Default is true.
   *
   * @param description Optional description string.
   */
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
    configure: TerraformInjectorNestedConfigureCallbackAsyncType<
      NestedConfigType,
      NestedSharedType,
      SharedType
    >,
    useDefaultConfig?: boolean,
    description?: string,
  ): TerraformInjectorElementContainerAsync<
    TerraformLazyElementAsync<
      NestedTerraformElementType,
      NestedConfigType,
      NestedSharedType
    >,
    SharedType
  > {
    return this.injector.provideLazily(
      nestedTerraformElementClass,
      id,
      configure,
      useDefaultConfig,
      description,
    );
  }

  setDefaultConfigure(
    defaultConfigure: (
      id: string,
      className: string,
      description?: string,
    ) => { [x: string]: any },
  ): TerraformInjectorStackAsync {
    this.injector.setDefaultConfigure(defaultConfigure);
    return this;
  }
  /**
   * Commit dependency injection for all the elements below the scope level.
   */
  inject(): Promise<void> {
    return this.injector.inject();
  }
}
