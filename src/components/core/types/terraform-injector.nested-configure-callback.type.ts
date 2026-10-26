import { TerraformLazyElementNestedConfig } from '../../../module';

/**
 * Configure callback for ```provideLazily```. Returns one {@link TerraformLazyElementNestedConfig}
 * per element to create, optionally as ```[configs, shared]```.
 */
export type TerraformInjectorNestedConfigureCallbackType<
  NestedConfigType,
  NestedSharedType,
  SharedType,
> = (
  id: string,
) =>
  | Array<
      TerraformLazyElementNestedConfig<
        Exclude<NestedConfigType, undefined>,
        NestedSharedType
      >
    >
  | [
      Array<
        TerraformLazyElementNestedConfig<
          Exclude<NestedConfigType, undefined>,
          NestedSharedType
        >
      >,
      SharedType,
    ];
