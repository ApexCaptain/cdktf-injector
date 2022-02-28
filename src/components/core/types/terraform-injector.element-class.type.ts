import { TerraformElement } from 'cdktf';
import { Construct } from 'constructs';

export type TerraformInjectorElementClassType<
  TerraformElementType extends TerraformElement,
  ConfigType,
> = {
  new (scope: Construct, id: string, config: ConfigType): TerraformElementType;
};
