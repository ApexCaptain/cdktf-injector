import { TerraformStack, TerraformElement, TerraformBackend } from 'cdktf';
import { Construct } from 'constructs';
import {
  TerraformInjectorFactory,
  TerraformInjector,
  TerraformInjectorClass,
  getCaller,
  TerraformInjectorElementClassType,
  TerraformInjectorBackendClassType,
  TerraformInjectorConfigureCallbackType,
  TerraformInjectorElementContainer,
} from '../../module';

/**
 * Stack class extends ```TerraformStack``` and implementing {@link TerraformInjector}.
 *
 * @see https://www.terraform.io/cdktf/concepts/stacks
 */
export class TerraformInjectorStack
  extends TerraformStack
  implements TerraformInjector
{
  private injector: TerraformInjector;
  constructor(
    scope: Construct,
    name: string,
    injectorDescription: string = `Injector of <${
      TerraformInjectorStack.name
    }> created at (${getCaller(1)})`,
  ) {
    super(scope, name);
    this.injector = TerraformInjectorFactory.scopesOn(
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
    terraformBackendClass: TerraformInjectorBackendClassType<
      TerraformBackendType,
      PropsType
    >,
    configure: TerraformInjectorConfigureCallbackType<PropsType, SharedType>,
    description?: string,
  ): TerraformInjectorElementContainer<TerraformBackendType, SharedType> {
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
    configure: TerraformInjectorConfigureCallbackType<ConfigType, SharedType>,
    useDefaultConfig?: boolean,
    description?: string,
  ): TerraformInjectorElementContainer<TerraformElementType, SharedType> {
    return this.injector.provide(
      terraformElementClass,
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
  ): void {
    this.injector.setDefaultConfigure(defaultConfigure);
  }

  /**
   * Commit dependency injection for all the elements below the scope level.
   */
  inject(): void {
    return this.injector.inject();
  }
}
