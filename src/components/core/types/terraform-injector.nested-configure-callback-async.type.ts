import { TerraformLazyElementNestedConfigAsync } from '../../../module';

/**
 * Async-injector variant of {@link TerraformInjectorNestedConfigureCallbackType}: each nested
 * configure may return a promise.
 */
export type TerraformInjectorNestedConfigureCallbackAsyncType<
  NestedConfigType,
  NestedSharedType,
  SharedType,
> = (
  id: string,
) =>
  | Array<
      TerraformLazyElementNestedConfigAsync<
        Exclude<NestedConfigType, undefined>,
        NestedSharedType
      >
    >
  | [
      Array<
        TerraformLazyElementNestedConfigAsync<
          Exclude<NestedConfigType, undefined>,
          NestedSharedType
        >
      >,
      SharedType,
    ];
