import {
  TerraformInjectorClass,
  TerraformInjectorConflictedInjectingMethodTypeError,
  injectorMap,
} from '../../../module';
export const commitInjection = (parentInjector: TerraformInjectorClass) => {
  const parentScopePath = parentInjector.scope.node.path;
  const children = Array.from(injectorMap.entries())
    .filter(([eachScope]) => eachScope.node.path.startsWith(parentScopePath))
    .map(([_, eachInjector]) => eachInjector);
  if (!parentInjector.useAsync)
    children.forEach((eachInjector) => {
      if (eachInjector.useAsync)
        throw new TerraformInjectorConflictedInjectingMethodTypeError('');
    });
};
