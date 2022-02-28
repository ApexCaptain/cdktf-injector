import { TerraformInjectorCommon } from '../../../module';
export interface TerraformInjectorAsync extends TerraformInjectorCommon {
  inject(): Promise<void>;
}
