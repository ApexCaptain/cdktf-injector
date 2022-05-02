import { TerraformLazyElementNestedConfig } from '../../../module';

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
