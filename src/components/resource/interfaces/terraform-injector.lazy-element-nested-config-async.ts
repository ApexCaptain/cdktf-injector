import {
  TerraformInjectorConfigureCallbackType,
  TerraformInjectorConfigureCallbackAsyncType,
} from '../../../module';

export interface TerraformLazyElementNestedConfigAsync<
  NestedConfigType,
  NestedSharedType = undefined,
> {
  id: string;
  configure:
    | TerraformInjectorConfigureCallbackType<NestedConfigType, NestedSharedType>
    | TerraformInjectorConfigureCallbackAsyncType<
        NestedConfigType,
        NestedSharedType
      >;
  useDefaultConfig?: boolean;
  description?: string;
}
