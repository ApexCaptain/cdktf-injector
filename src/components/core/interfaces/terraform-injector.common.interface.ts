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
  /**
   * Register a callback that runs whenever an element of this injector is instantiated,
   * after its own ```afterInitElement``` callbacks. Useful for cross-cutting work such as tagging.
   *
   * @param onNewElementInjectedCallback Receives each newly created element.
   */
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
   * @param configure Configuration callback for certain backend class.
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
   * @param configure Configuration callback for certain element class.
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

  /**
   * Lazily provide elements to the injector.
   *
   * The configure callback returns a list of nested element configs (or ```[configs, shared]```).
   * When the lazy element is injected, each entry is provided to this injector as a sibling
   * element of ```nestedTerraformElementClass``` with its own id, so the number of elements can
   * depend on other elements. Access them through ```element.nested```.
   *
   * @see https://www.terraform.io/cdktf/concepts/providers-and-resources
   *
   * @param nestedTerraformElementClass Terraform element class to instantiate for each entry.
   *
   * @param id The scoped construct ID of the lazy element. Must be unique amongst siblings in the same scope.
   *
   * @param configure Callback returning the nested element configs.
   *
   * @param useDefaultConfig Set false to ignore default config of the injector. Default is true.
   *
   * @param description Optional description string.
   */
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

  /**
   * Set a default config that is deep-merged into every element provided under this scope,
   * including elements of nested injectors.
   *
   * Merge order is outermost scope first, then inner scopes, then the element's own config, so
   * the more specific value wins. Arrays are replaced, not concatenated. ```TerraformOutput```
   * and elements provided with ```useDefaultConfig = false``` are skipped.
   *
   * @param defaultConfigure Returns the default config for an element, given its id, class name and description.
   */
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
