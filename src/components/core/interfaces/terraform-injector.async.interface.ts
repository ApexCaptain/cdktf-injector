import { TerraformElement } from 'cdktf';
import {
  TerraformInjectorCommon,
  TerraformInjectorElementClassType,
  TerraformInjectorElementContainerAsync,
  TerraformInjectorNestedConfigureCallbackAsyncType,
  TerraformLazyElementAsync,
} from '../../../module';

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

  provideLazily<
    NestedTerraformElementType extends TerraformElement,
    NestedConfigType,
    NestedSharedType = undefined,
    SharedType = undefined,
  >(
    nestedTerraformElementClass: TerraformInjectorElementClassType<
      NestedTerraformElementType,
      NestedConfigType
    >,
    id: string,
    configure: TerraformInjectorNestedConfigureCallbackAsyncType<
      NestedConfigType,
      NestedSharedType,
      SharedType
    >,
    useDefaultConfig?: boolean,
    description?: string,
  ): TerraformInjectorElementContainerAsync<
    TerraformLazyElementAsync<
      NestedTerraformElementType,
      NestedConfigType,
      NestedSharedType
    >,
    SharedType
  >;

  setDefaultConfigure(
    defaultConfigure: (
      id: string,
      className: string,
      description?: string,
    ) => {
      [x: string]: any;
    },
  ): TerraformInjectorAsync;
}
