import { TerraformInjectorElementContainerClass } from '../../../module';

/**
 * ```element``` or ```shared``` was read before injection. During injection it is caught
 * internally to detect dependencies; you only see it when reading outside ```inject()```.
 */
export class TerraformInjectorElementContainerUninitializedError extends Error {
  constructor(
    message: string,
    public container: TerraformInjectorElementContainerClass<any, any, any>,
  ) {
    super(message);
    this.name = TerraformInjectorElementContainerUninitializedError.name;
  }
}
