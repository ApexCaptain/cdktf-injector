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

export class TerraformInjectorStack
  extends TerraformStack
  implements TerraformInjector
{
  private injector: TerraformInjector;

  backend: <
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
  ) => TerraformInjectorElementContainer<TerraformBackendType, SharedType>;
  provide: <
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
    description?: string,
  ) => TerraformInjectorElementContainer<TerraformElementType, SharedType>;
  inject: () => void;
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
    this.backend = this.injector.backend.bind(this.injector);
    this.provide = this.injector.provide.bind(this.injector);
    this.inject = this.injector.inject.bind(this.injector);
  }
}
