import { TerraformStack, TerraformBackend, TerraformElement } from 'cdktf';
import { Construct } from 'constructs';
import {
  TerraformInjectorFactory,
  TerraformInjectorAsync,
  getCaller,
  TerraformInjectorClass,
  TerraformInjectorElementContainerAsync,
  TerraformInjectorBackendClassType,
  TerraformInjectorConfigureCallbackType,
  TerraformInjectorConfigureCallbackAsyncType,
  TerraformInjectorElementClassType,
} from '../../module';

/**
 * Stack class extends ```TerraformStack``` and implementing {@link TerraformInjectorAsync}.
 */
export class TerraformInjectorStackAsync
  extends TerraformStack
  implements TerraformInjectorAsync
{
  private injector;
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
  backend: <
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
  ) => TerraformInjectorElementContainerAsync<TerraformBackendType, SharedType>;

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
   * @param description Optional description string.
   */
  provide: <
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
  ) => TerraformInjectorElementContainerAsync<TerraformElementType, SharedType>;

  /**
   * Commit dependency injection for all the elements below the scope level.
   */
  inject: () => Promise<void>;

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
    this.backend = this.injector.backend.bind(this.injector);
    this.provide = this.injector.provide.bind(this.injector);
    this.inject = this.injector.inject.bind(this.injector);
  }
}
