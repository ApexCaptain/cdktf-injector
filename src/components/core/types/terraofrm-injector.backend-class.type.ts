import { TerraformElement } from 'cdktf';
import { Construct } from 'constructs';

export type TerraformInjectorBackendClassType<
  TerraformBackendType extends TerraformElement,
  PropsType,
> = {
  new (scope: Construct, config: PropsType): TerraformBackendType;
};
