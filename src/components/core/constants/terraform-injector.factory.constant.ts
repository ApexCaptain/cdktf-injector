import { Construct } from 'constructs';
import {
  TerraformInjectorClass,
  TerraformInjectorConflictedInjectingMethodTypeError,
  TerraformInjector,
  TerraformInjectorAsync,
  getCaller,
} from '../../../module';

export const injectorMap = new Map<Construct, TerraformInjectorClass>();
const createInjector = (
  scope: Construct,
  useAsync: boolean,
  description?: string,
): TerraformInjectorClass => {
  const injector = injectorMap.has(scope)
    ? injectorMap.get(scope)!
    : injectorMap
        .set(
          scope,
          new TerraformInjectorClass(
            scope,
            useAsync,
            getCaller(1),
            description,
          ),
        )
        .get(scope)!;
  if (injector.useAsync != useAsync)
    throw new TerraformInjectorConflictedInjectingMethodTypeError(
      `You cannot use both '${TerraformInjectorFactory.scopesOn.name}' and '${TerraformInjectorFactory.scopesOnAsync.name}' for the same scope simultaneously.`,
    );
  return injector;
};
/**
 * @see https://www.terraform.io/cdktf/concepts/constructs
 * Constant object for creating {@link TerraformInjector} or {@link TerraformInjectorAsync} instance.
 * You can use either one of ```scopeOn``` or ```scopeOnAsync``` function on a same scope, not both.
 */
export const TerraformInjectorFactory = {
  /**
   * Create or get a {@link TerraformInjector} instance on a certain {@link https://www.npmjs.com/package/constructs Construct} scope.
   * @param {Construct} scope {@link https://www.npmjs.com/package/constructs Construct} instance that {@link TerraformInjector} scopes on.
   * @param {string} description Optional description string for the instance.
   * @returns {TerraformInjector}
   * @throws {TerraformInjectorConflictedInjectingMethodTypeError} When you try to load both static/async injector on the same scope.
   */
  scopesOn: (scope: Construct, description?: string): TerraformInjector => {
    return createInjector(scope, false, description);
  },

  /**
   * Create or get a {@link TerraformInjectorAsync} instance on a certain {@link https://www.npmjs.com/package/constructs Construct} scope.
   * @param {Construct} scope {@link https://www.npmjs.com/package/constructs Construct} instance that {@link TerraformInjectorAsync} scopes on.
   * @param {string} description Optional description string for the instance.
   * @returns {TerraformInjectorAsync}
   * @throws {TerraformInjectorConflictedInjectingMethodTypeError} When you try to load both static/async injector on the same scope.
   */
  scopesOnAsync: (
    scope: Construct,
    description?: string,
  ): TerraformInjectorAsync => {
    return createInjector(scope, true, description) as TerraformInjectorAsync;
  },
};
