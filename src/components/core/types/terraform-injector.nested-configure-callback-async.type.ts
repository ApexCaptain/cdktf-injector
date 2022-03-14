import { TerraformLazyElementNestedConfigAsync } from '../../../module';

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
