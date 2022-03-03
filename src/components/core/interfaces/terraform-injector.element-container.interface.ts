import { TerraformElement, TerraformOutputConfig } from 'cdktf';
import { TerraformInjectorElementContainerAsync } from '../../../module';
export interface TerraformInjectorElementContainer<
  TerraformElementType extends TerraformElement,
  SharedType,
> extends TerraformInjectorElementContainerAsync<
    TerraformElementType,
    SharedType
  > {
  // Overridden Methods
  afterInitElement(
    afterInitCallback: (
      element: TerraformElementType,
      shared: SharedType,
    ) => void,
  ): TerraformInjectorElementContainer<TerraformElementType, SharedType>;

  afterDependenciesInjected(
    afterInitCallback: (
      element: TerraformElementType,
      shared: SharedType,
    ) => void,
  ): TerraformInjectorElementContainer<TerraformElementType, SharedType>;

  addOutput(
    outputId: string | ((elementId: string) => string),
    outputConfig: (
      element: TerraformElementType,
      shared: SharedType,
    ) => TerraformOutputConfig,
  ): TerraformInjectorElementContainer<TerraformElementType, SharedType>;
}
