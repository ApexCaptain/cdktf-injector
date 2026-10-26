import { TerraformInjectorConfigAndSharedObjectType } from '../../../module';
/** Promise-returning configure callback, accepted only by async injectors. */
export type TerraformInjectorConfigureCallbackAsyncType<
  ConfigType,
  SharedType,
> = (
  id: string,
) => Promise<
  TerraformInjectorConfigAndSharedObjectType<ConfigType, SharedType>
>;
