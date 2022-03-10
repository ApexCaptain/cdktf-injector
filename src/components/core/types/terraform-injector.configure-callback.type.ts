import { TerraformInjectorConfigAndSharedObjectType } from '../../../module';
export type TerraformInjectorConfigureCallbackType<ConfigType, SharedType> = (
  id: string,
) => TerraformInjectorConfigAndSharedObjectType<ConfigType, SharedType>;
