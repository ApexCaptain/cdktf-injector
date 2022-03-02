import { TerraformElement, TerraformOutputConfig } from 'cdktf';
import { TerraformInjectorElementContainerAsync } from '../../../module';
export interface TerraformInjectorElementContainer<
  TerraformElementType extends TerraformElement,
  SharedType,
> extends TerraformInjectorElementContainerAsync<
    TerraformElementType,
    SharedType
  > {
  // Overriden Methods
  addOutput(
    outputId: string | ((elementId: string) => string),
    outputConfig: (
      element: TerraformElementType,
      shared: SharedType,
    ) => TerraformOutputConfig,
  ): TerraformInjectorElementContainer<TerraformElementType, SharedType>;
}
