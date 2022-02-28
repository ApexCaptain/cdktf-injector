import { TerraformInjectorConfigAndSharedObjectType } from '../../../module';
export type TerraformInjectorConfigureCallbackType<ConfigType, SharedType> =
  () => TerraformInjectorConfigAndSharedObjectType<ConfigType, SharedType>;
