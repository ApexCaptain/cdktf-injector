import { TerraformElement, TerraformBackend } from 'cdktf';
import {
  TerraformInjectorElementClassType,
  TerraformInjectorConfigureCallbackType,
  TerraformInjectorConfigureCallbackAsyncType,
  TerraformInjectorElementContainerAsync,
  TerraformInjectorElementClassWithoutIdType,
  TerraformInjectorNestedConfigureCallbackAsyncType,
  TerraformInjectorNestedConfigureCallbackType,
  TerraformLazyElementAsync,
  TerraformLazyElement,
  TerraformInjectorElementContainer,
} from '../../../module';

/**
 * Terraform DI class interface.
 *
 * You can provide any elements inheriting ```TerraformElement``` with ```provide``` method.
 *
 * And there is a special ```backend``` method only for providing an ```TerraformBackend``` element.
 *
 * You can later inject all the dependencies below the scope level of the instance by using ```inject``` method.
 */
export interface TerraformInjectorCommon {
  onNewElementInjected(
    onNewElementInjectedCallback: (element: TerraformElement) => void,
  ): TerraformInjectorCommon;

  /**
   * Set backend of the injector. You cannot provide multiple backend elements to the injector and only one backend
   * could be provided for one stack each.
   *
   * @see https://www.terraform.io/cdktf/concepts/remote-backends
   *
   * @param terraformBackendClass Remote backend class to instantiate.
   *
   * @param configure Configuration callbak for certain backend class.
   *
   * @param description Optional description string.
   */
  backend<
    TerraformBackendType extends TerraformBackend,
    PropsType,
    SharedType = undefined,
  >(
    terraformBackendClass: TerraformInjectorElementClassWithoutIdType<
      TerraformBackendType,
      PropsType
    >,
    configure:
      | TerraformInjectorConfigureCallbackType<PropsType, SharedType>
      | TerraformInjectorConfigureCallbackAsyncType<PropsType, SharedType>,
    description?: string,
  ): TerraformInjectorElementContainerAsync<TerraformBackendType, SharedType>;

  /**
   * Provide an element to the injector.
   *
   * @see https://www.terraform.io/cdktf/concepts/providers-and-resources
   *
   * @param terraformElementClass Terraform element class to instantiate.
   *
   * @param id The scoped construct ID. Must be unique amongst siblings in the same scope.
   *
   * @param configure Configuration callbak for certain element class.
   *
   * @param useDefaultConfig Set false to ignore default config of the injector. Default is true.
   *
   * @param description Optional description string.
   */
  provide<
    TerraformElementType extends TerraformElement,
    ConfigType,
    SharedType = undefined,
  >(
    terraformElementClass: TerraformInjectorElementClassType<
      TerraformElementType,
      ConfigType
    >,
    id: string,
    configure:
      | TerraformInjectorConfigureCallbackType<ConfigType, SharedType>
      | TerraformInjectorConfigureCallbackAsyncType<ConfigType, SharedType>,
    useDefaultConfig?: boolean,
    description?: string,
  ): TerraformInjectorElementContainerAsync<TerraformElementType, SharedType>;

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
    configure:
      | TerraformInjectorNestedConfigureCallbackAsyncType<
          NestedConfigType,
          NestedSharedType,
          SharedType
        >
      | TerraformInjectorNestedConfigureCallbackType<
          NestedConfigType,
          NestedSharedType,
          SharedType
        >,
    useDefaultConfig?: boolean,
    description?: string,
  ):
    | TerraformInjectorElementContainerAsync<
        TerraformLazyElementAsync<
          NestedTerraformElementType,
          NestedConfigType,
          NestedSharedType
        >,
        SharedType
      >
    | TerraformInjectorElementContainer<
        TerraformLazyElement<
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
  ): TerraformInjectorCommon;
}
