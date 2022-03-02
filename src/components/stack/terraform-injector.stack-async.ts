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

export class TerraformInjectorStackAsync
  extends TerraformStack
  implements TerraformInjectorAsync
{
  private injector;
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
