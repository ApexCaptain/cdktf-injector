import { TerraformElement } from 'cdktf';
import {
  TerraformInjectorElementClassType,
  TerraformInjectorClass,
  TerraformLazyElementNestedConfigAsync,
} from '../../../module';

/**
 * Config the injector passes to {@link TerraformLazyElementAsync}. Built internally by ```provideLazily```.
 */
export interface TerraformLazyElementConfigAsync<
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
    TerraformLazyElementNestedConfigAsync<NestedConfigType, NestedSharedType>
  >;
}
