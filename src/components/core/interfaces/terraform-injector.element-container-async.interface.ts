import { TerraformElement, TerraformOutputConfig } from 'cdktf';

/**
 * Injectable terraform element container. You cannot instantiate directly, only by
 * ```yourInjector.provide``` or ```yourInjector.backend```(for backend only).
 */
export interface TerraformInjectorElementContainerAsync<
  TerraformElementType extends TerraformElement,
  SharedType,
> {
  // Getters
  /**
   * Get shared object.
   *
   * @throws ```Uninitialized``` : When you try to get data before injection.
   */
  get shared(): SharedType;

  /**
   * Get terraform element.
   *
   * @throws ```Uninitialized``` : When you try to get data before injection.
   */
  get element(): TerraformElementType;

  // Methods
  /**
   * Add ```after init callback```. Callbacks will run right after this element is initialized.
   *
   * You can add multiple callbacks, then they will be executed in sequence.
   *
   * @param afterInitCallback Action block to execute right after element is created.
   */
  afterInitElement(
    afterInitCallback: (
      element: TerraformElementType,
      shared: SharedType,
    ) => void | Promise<void>,
  ): TerraformInjectorElementContainerAsync<TerraformElementType, SharedType>;

  /**
   * Add ```after dependencies injected callback```. Callback will run after dependency injection process is completed.
   *
   * You can add multiple callbacks, then they will be executed in sequence.
   *
   * @param afterDependenciesInjectedCallback Action block to execute after di process
   */
  afterDependenciesInjected(
    afterDependenciesInjectedCallback: (
      element: TerraformElementType,
      shared: SharedType,
    ) => void | Promise<void>,
  ): TerraformInjectorElementContainerAsync<TerraformElementType, SharedType>;

  /**
   * Add ```TerraformOutput```. You can provide output element by ```provide``` method of ```injector``` but
   * sometime, it would be more clear using ```addOutput``` method for each element.
   *
   * @see https://www.terraform.io/cdktf/concepts/variables-and-outputs
   *
   * @param outputId Id string for output element. It could either be a string or another callback that retunrs a string. Likewise, it also has to be unique amongst other siblings.
   * @param outputConfig Configuration callbak for ```TerraformOutput``` class.
   */
  addOutput(
    outputId: string | ((elementId: string) => string),
    outputConfig: (
      element: TerraformElementType,
      shared: SharedType,
    ) => TerraformOutputConfig,
  ): TerraformInjectorElementContainerAsync<TerraformElementType, SharedType>;
}
