import { TerraformElement, TerraformBackend } from 'cdktf';
import {
  TerraformInjectorCommon,
  TerraformInjectorElementClassType,
  TerraformInjectorConfigureCallbackType,
  TerraformInjectorBackendClassType,
  TerraformInjectorElementContainer,
} from '../../../module';

export interface TerraformInjector extends TerraformInjectorCommon {
  backend<
    TerraformBackendType extends TerraformBackend,
    PropsType,
    SharedType = {},
  >(
    terraformBackendClass: TerraformInjectorBackendClassType<
      TerraformBackendType,
      PropsType
    >,
    configure: TerraformInjectorConfigureCallbackType<PropsType, SharedType>,
    description?: string,
  ): TerraformInjectorElementContainer<TerraformBackendType, SharedType>;
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
    configure: TerraformInjectorConfigureCallbackType<ConfigType, SharedType>,
    description?: string,
  ): TerraformInjectorElementContainer<TerraformElementType, SharedType>;
  inject(): void;
}
