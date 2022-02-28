import { TerraformElement, TerraformBackend } from 'cdktf';
import {
  TerraformInjectorElementClassType,
  TerraformInjectorConfigureCallbackType,
  TerraformInjectorConfigureCallbackAsyncType,
  TerraformInjectorElementContainerAsync,
  TerraformInjectorBackendClassType,
} from '../../../module';

export interface TerraformInjectorCommon {
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
  ): TerraformInjectorElementContainerAsync<TerraformBackendType, SharedType>;
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
  ): TerraformInjectorElementContainerAsync<TerraformElementType, SharedType>;
}
