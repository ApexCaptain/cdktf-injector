import { TerraformInjectorElementContainerClass } from '../../../module';

export class TerraformInjectorElementContainerDependencyCycleError extends Error {
  constructor(
    cycledContainers: Array<
      TerraformInjectorElementContainerClass<any, any, any>
    >,
  ) {
    cycledContainers.forEach((e) => {
      e.name;
    });
    super('qwe');
  }
}
