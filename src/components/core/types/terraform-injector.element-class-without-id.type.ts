import { TerraformElement } from 'cdktf';
import { Construct } from 'constructs';

/** Constructor shape of a backend, which takes no id: ```new (scope, config)```. */
export type TerraformInjectorElementClassWithoutIdType<
  TerraformBackendType extends TerraformElement,
  PropsType,
> = {
  new (scope: Construct, config: PropsType): TerraformBackendType;
};
