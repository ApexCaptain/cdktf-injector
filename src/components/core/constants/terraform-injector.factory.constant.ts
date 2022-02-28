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
    : new TerraformInjectorClass(scope, useAsync, getCaller(1), description);
  if (injector.useAsync != useAsync)
    throw new TerraformInjectorConflictedInjectingMethodTypeError(
      `You cannot use both '${TerraformInjectorFactory.scopesOn.name}' and '${TerraformInjectorFactory.scopesOnAsync.name}' for the same scope simultaneously.`,
    );
  return injector;
};
export const TerraformInjectorFactory = {
  scopesOn: (scope: Construct, description?: string): TerraformInjector => {
    return createInjector(scope, false, description);
  },
  scopesOnAsync: (
    scope: Construct,
    description?: string,
  ): TerraformInjectorAsync => {
    return createInjector(scope, true, description) as TerraformInjectorAsync;
  },
};
