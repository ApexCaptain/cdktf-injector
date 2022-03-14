import { TerraformElement } from 'cdktf';
import { Construct } from 'constructs';
import {
  TerraformInjectorElementContainerAsync,
  TerraformLazyElementConfigAsync,
} from '../../module';

export class TerraformLazyElementAsync<
  NestedTerraformElementType extends TerraformElement,
  NestedConfigType,
  NestedSharedType = undefined,
> extends TerraformElement {
  public nested: TerraformInjectorElementContainerAsync<
    NestedTerraformElementType,
    NestedSharedType
  >[];
  constructor(
    scope: Construct,
    id: string,
    config: TerraformLazyElementConfigAsync<
      NestedTerraformElementType,
      NestedConfigType,
      NestedSharedType
    >,
  ) {
    super(scope, id);
    this.nested = config.nestedConfigure.map((eachConfigure) =>
      config.injector.provide(
        config.nestedTerraformElementClass,
        eachConfigure.id,
        eachConfigure.configure,
        eachConfigure.useDefaultConfig,
        eachConfigure.description,
      ),
    );
  }
}
