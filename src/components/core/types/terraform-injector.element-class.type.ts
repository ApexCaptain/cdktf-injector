import { TerraformElement } from 'cdktf';
import { Construct } from 'constructs';

/** Constructor shape of an ordinary element: ```new (scope, id, config)```. */
export type TerraformInjectorElementClassType<
  TerraformElementType extends TerraformElement,
  ConfigType,
> = {
  new (scope: Construct, id: string, config: ConfigType): TerraformElementType;
};
