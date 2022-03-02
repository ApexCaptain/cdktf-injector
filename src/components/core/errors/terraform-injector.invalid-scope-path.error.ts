import { Construct } from 'constructs';
import { TerraformInjectorElementContainerClass } from '../../../module';

export class TerraformInjectorInvalidScopePathError extends Error {
  constructor(
    parentScope: Construct,
    dependentElement: TerraformInjectorElementContainerClass<any, any, any>,
    invalidElement: TerraformInjectorElementContainerClass<any, any, any>,
  ) {
    super(
      `Element ${invalidElement.scope.node.path}/${invalidElement.id} is not under the scope path <${parentScope.node.path}>. ${dependentElement.scope.node.path}/${dependentElement.id} depends on it`,
    );
  }
}
