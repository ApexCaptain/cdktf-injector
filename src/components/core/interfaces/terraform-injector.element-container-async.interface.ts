import { TerraformElement, TerraformOutputConfig } from 'cdktf';
export interface TerraformInjectorElementContainerAsync<
  TerraformElementType extends TerraformElement,
  SharedType,
> {
  // Getters
  get shared(): SharedType;
  get element(): TerraformElementType;

  // Methods
  afterInitElement(
    afterInitCallback: (
      element: TerraformElementType,
      shared: SharedType,
    ) => void | Promise<void>,
  ): TerraformInjectorElementContainerAsync<TerraformElementType, SharedType>;

  afterDependenciesInjected(
    afterInitCallback: (
      element: TerraformElementType,
      shared: SharedType,
    ) => void | Promise<void>,
  ): TerraformInjectorElementContainerAsync<TerraformElementType, SharedType>;

  addOutput(
    outputId: string | ((elementId: string) => string),
    outputConfig: (
      element: TerraformElementType,
      shared: SharedType,
    ) => TerraformOutputConfig,
  ): TerraformInjectorElementContainerAsync<TerraformElementType, SharedType>;
}
