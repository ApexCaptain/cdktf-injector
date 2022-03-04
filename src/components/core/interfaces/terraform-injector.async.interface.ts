import { TerraformInjectorCommon } from '../../../module';

/**
 * Asynchronous DI class interface.
 *
 * You can provide any elements inheriting ```TerraformElement``` with ```provide``` method.
 *
 * And there is a special ```backend``` method only for providing an ```TerraformBackend``` element.
 *
 * You can later inject all the dependencies below the scope level of the instance by using ```inject``` method.
 */
export interface TerraformInjectorAsync extends TerraformInjectorCommon {
  /**
   * Commit dependency injection for all the elements below the scope level.
   */
  inject(): Promise<void>;
}
