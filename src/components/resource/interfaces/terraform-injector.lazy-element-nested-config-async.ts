import {
  TerraformInjectorConfigureCallbackType,
  TerraformInjectorConfigureCallbackAsyncType,
} from '../../../module';

/** Async-injector variant of {@link TerraformLazyElementNestedConfig}; ```configure``` may be async. */
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
