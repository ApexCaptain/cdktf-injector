import { TerraformInjectorConfigAndSharedObjectType } from '../../../module';
export type TerraformInjectorConfigureCallbackAsyncType<
  ConfigType,
  SharedType,
> = () => Promise<
  TerraformInjectorConfigAndSharedObjectType<ConfigType, SharedType>
>;
