import { TerraformElement } from 'cdktf';
import { Construct } from 'constructs';
import {
  TerraformInjectorElementContainer,
  TerraformLazyElementConfig,
} from '../../module';

export class TerraformLazyElement<
  NestedTerraformElementType extends TerraformElement,
  NestedConfigType,
  NestedSharedType = undefined,
> extends TerraformElement {
  public nested: TerraformInjectorElementContainer<
    NestedTerraformElementType,
    NestedSharedType
  >[];
  constructor(
    scope: Construct,
    id: string,
    config: TerraformLazyElementConfig<
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
