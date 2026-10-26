import { TerraformInjectorConfigAndSharedObjectType } from '../../../module';
/**
 * Configure callback for ```provide``` / ```backend```. Called once during injection with the
 * element id. Reading another container's ```element``` here is what declares the dependency.
 */
export type TerraformInjectorConfigureCallbackType<ConfigType, SharedType> = (
  id: string,
) => TerraformInjectorConfigAndSharedObjectType<ConfigType, SharedType>;
