import { TerraformInjectorConfigureCallbackType } from '../../../module';

export interface TerraformLazyElementNestedConfig<
  NestedConfigType,
  NestedSharedType = undefined,
> {
  id: string;
  configure: TerraformInjectorConfigureCallbackType<
    NestedConfigType,
    NestedSharedType
  >;
  useDefaultConfig?: boolean;
  description?: string;
}
