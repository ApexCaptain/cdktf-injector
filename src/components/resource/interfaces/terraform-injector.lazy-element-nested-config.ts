import { TerraformInjectorConfigureCallbackType } from '../../../module';

/** One element to create from a ```provideLazily``` configure callback. */
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
