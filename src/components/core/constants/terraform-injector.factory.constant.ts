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
 * Constant object for creating {@link TerraformInjector} or {@link TerraformInjectorAsync} instance.
 * You can use only one of ```scopesOn``` or ```scopesOnAsync``` function for one {@link https://www.npmjs.com/package/constructs Construct} instance, not both.
 *
 * @see https://www.terraform.io/cdktf/concepts/constructs
 */
export const TerraformInjectorFactory = {
  /**
   * Create or get a {@link TerraformInjector} instance on a certain {@link https://www.npmjs.com/package/constructs Construct} scope.
   *
   * @param {Construct} scope {@link https://www.npmjs.com/package/constructs Construct} instance that {@link TerraformInjector} scopes on.
   *
   * @param {string} description Optional description string for the injector instance.
   *
   * @returns {TerraformInjector}
   *
   * @throws ```Conflicted Injecting Method Type``` : When you already have used ```scopesOnAsync``` function for the same scope.
   */
  scopesOn: (scope: Construct, description?: string): TerraformInjector => {
    return createInjector(scope, false, description);
  },

  /**
   * Create or get a {@link TerraformInjectorAsync} instance on a certain {@link https://www.npmjs.com/package/constructs Construct} scope.
   *
   * @param {Construct} scope {@link https://www.npmjs.com/package/constructs Construct} instance that {@link TerraformInjectorAsync} scopes on.
   *
   * @param {string} description Optional description string for the injector instance.
   *
   * @returns {TerraformInjectorAsync}
   *
   * @throws ```Conflicted Injecting Method Type``` : When you already have used ```scopesOn``` function for the same scope.
   */
  scopesOnAsync: (
    scope: Construct,
    description?: string,
  ): TerraformInjectorAsync => {
    return createInjector(scope, true, description) as TerraformInjectorAsync;
  },
};
