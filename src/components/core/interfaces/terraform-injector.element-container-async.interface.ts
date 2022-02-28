import { TerraformElement, TerraformOutputConfig } from 'cdktf';
export interface TerraformInjectorElementContainerAsync<
  TerraformElementType extends TerraformElement,
  SharedType,
> {
  // Properties
  name: string;

  // Getters
  get shared(): SharedType;
  get element(): TerraformElementType;

  // Methods
  addOutput(
    outputId: string | ((elementId: string) => string | Promise<string>),
    outputConfig: (
      element: TerraformElementType,
      shared: SharedType,
    ) => TerraformOutputConfig | Promise<TerraformOutputConfig>,
  ): TerraformInjectorElementContainerAsync<TerraformElementType, SharedType>;
}
