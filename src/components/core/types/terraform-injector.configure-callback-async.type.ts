import { TerraformInjectorConfigAndSharedObjectType } from '../../../module';
export type TerraformInjectorConfigureCallbackAsyncType<
  ConfigType,
  SharedType,
> = (
  id: string,
) => Promise<
  TerraformInjectorConfigAndSharedObjectType<ConfigType, SharedType>
>;
