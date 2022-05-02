import { TerraformElement } from 'cdktf';
import {
  TerraformInjectorElementClassType,
  TerraformInjectorClass,
  TerraformLazyElementNestedConfigAsync,
} from '../../../module';

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
