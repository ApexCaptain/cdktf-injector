import {
  TerraformInjectorElementContainerClass,
  TerraformInjectorElementContainerSelfDependenceError,
  TerraformInjectorClass,
  TerraformInjectorConflictedInjectingMethodTypeError,
  TerraformInjectorElementContainerDependencyCycleError,
  TerraformInjectorInvalidScopePathError,
  injectorMap,
} from '../../../module';

export const commitInjection = (
  parentInjector: TerraformInjectorClass,
): void | Promise<void> => {
  const parentScopePath = parentInjector.scope.node.path;
  const parentDepthLength = parentScopePath.split('/').length;
  const children = Array.from(injectorMap.entries())
    .filter(
      ([eachScope]) =>
        eachScope.node.path.split('/').slice(0, parentDepthLength).join('/') ==
        parentScopePath,
    )
    .map(([_, eachInjector]) => eachInjector);

  if (!parentInjector.useAsync) {
    children.forEach((eachInjector) => {
      if (eachInjector.useAsync && !eachInjector.isInjected) {
        throw new TerraformInjectorConflictedInjectingMethodTypeError(
          `Synchronous injector on ${parentScopePath} cannot commit cascading injection on nested asynchronous injector on ${eachInjector.scope.node.path}. You should call "inject" function of nested one, or wrap the parent with async injector.`,
        );
      }
    });
  }

  const elementContainerSet = new Set(
    children
      .map((eachChildInjector) =>
        Array.from(eachChildInjector.elementMap.values()),
      )
      .flat(),
  );

  const containerDependencyCycleStack = new Array<
    TerraformInjectorElementContainerClass<any, any, any>
  >();

  if (parentInjector.useAsync) {
    return new Promise(async (resolve, reject) => {
      try {
        for (const eachContainer of elementContainerSet) {
          if (eachContainer.isInitialized) continue;
          containerDependencyCycleStack.push(eachContainer);
          while (containerDependencyCycleStack.length) {
            const topContainer = containerDependencyCycleStack.pop()!;
            const newDepContainer = await topContainer.injectAsync();
            if (!newDepContainer) continue;
            if (topContainer == newDepContainer)
              throw new TerraformInjectorElementContainerSelfDependenceError(
                `${topContainer.name} is self-dependent. You cannot use its own element when you configure the container.`,
              );
            if (!elementContainerSet.has(newDepContainer))
              throw new TerraformInjectorInvalidScopePathError(
                parentInjector.scope,
                topContainer,
                newDepContainer,
              );
            containerDependencyCycleStack.push(topContainer, newDepContainer);
            const cyclePoint =
              containerDependencyCycleStack.indexOf(newDepContainer);
            if (cyclePoint != containerDependencyCycleStack.length - 1) {
              throw new TerraformInjectorElementContainerDependencyCycleError(
                containerDependencyCycleStack.slice(cyclePoint, -1),
              );
            }
          }
        }
        for (const eachContainer of elementContainerSet)
          for (const eachAfterDependencyInjectedCallback of eachContainer.afterDependenciesInjectedCallbackArray)
            await eachAfterDependencyInjectedCallback(
              eachContainer.element,
              eachContainer.shared,
            );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  for (const eachContainer of elementContainerSet) {
    if (eachContainer.isInitialized) continue;
    containerDependencyCycleStack.push(eachContainer);
    while (containerDependencyCycleStack.length) {
      const topContainer = containerDependencyCycleStack.pop()!;
      const newDepContainer = topContainer.inject();
      if (!newDepContainer) continue;
      if (topContainer == newDepContainer)
        throw new TerraformInjectorElementContainerSelfDependenceError(
          `${topContainer.name} is self-dependent. You cannot use its own element when you configure the container.`,
        );
      if (!elementContainerSet.has(newDepContainer))
        throw new TerraformInjectorInvalidScopePathError(
          parentInjector.scope,
          topContainer,
          newDepContainer,
        );
      containerDependencyCycleStack.push(topContainer, newDepContainer);
      const cyclePoint = containerDependencyCycleStack.indexOf(newDepContainer);
      if (cyclePoint != containerDependencyCycleStack.length - 1) {
        throw new TerraformInjectorElementContainerDependencyCycleError(
          containerDependencyCycleStack.slice(cyclePoint, -1),
        );
      }
    }
  }
  for (const eachContainer of elementContainerSet)
    for (const eachAfterDependencyInjectedCallback of eachContainer.afterDependenciesInjectedCallbackArray)
      void eachAfterDependencyInjectedCallback(
        eachContainer.element,
        eachContainer.shared,
      );
};
