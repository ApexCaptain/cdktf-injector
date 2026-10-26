import { TerraformElement } from 'cdktf';
import {
  TerraformInjectorElementClassType,
  TerraformInjectorClass,
  TerraformLazyElementNestedConfig,
} from '../../../module';
/**
 * Config the injector passes to {@link TerraformLazyElement}. Built internally by ```provideLazily```.
 */
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
