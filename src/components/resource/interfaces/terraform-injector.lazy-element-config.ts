import { TerraformElement } from 'cdktf';
import {
  TerraformInjectorElementClassType,
  TerraformInjectorClass,
  TerraformLazyElementNestedConfig,
} from '../../../module';
export interface TerraformLazyElementConfig<
  NestedTerraformElementType extends TerraformElement,
  NestedConfigType,
  NestedSharedType = undefined,
> {
  nestedTerraformElementClass: TerraformInjectorElementClassType<
    NestedTerraformElementType,
    NestedConfigType
  >;
  injector: TerraformInjectorClass;
  nestedConfigure: Array<
    TerraformLazyElementNestedConfig<NestedConfigType, NestedSharedType>
  >;
}
