import { TerraformInjectorElementContainerClass } from '../../../module';

export class TerraformInjectorElementContainerUninitializedError extends Error {
  constructor(
    message: string,
    public container: TerraformInjectorElementContainerClass<any, any, any>,
  ) {
    super(message);
    this.name = TerraformInjectorElementContainerUninitializedError.name;
  }
}
