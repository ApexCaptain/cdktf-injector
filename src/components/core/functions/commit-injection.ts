import { Construct } from 'constructs';
import {
  TerraformInjectorElementContainerClass,
  TerraformInjectorElementContainerSelfDependenceError,
  TerraformInjectorClass,
  TerraformInjectorConflictedInjectingMethodTypeError,
  TerraformInjectorElementContainerDependencyCycleError,
  TerraformInjectorInvalidScopePathError,
  injectorMap,
} from '../../../module';
const isScopeUnder = (stdPath: string, targetScope: Construct) => {
  return stdPath === ''
    ? true
    : targetScope.node.path
        .split('/')
        .slice(0, stdPath.split('/').length)
        .join('/') == stdPath;
};
const getInjectorsUnder = (rootScopePath: string) => {
  const injectors = Array.from(injectorMap.values());
  return Array.from(
    injectors.filter((eachInjector) =>
      isScopeUnder(rootScopePath, eachInjector.scope),
    ),
  );
};
const getInjectorsUpper = (
  injectors: Array<TerraformInjectorClass>,
  targetInjector: TerraformInjectorClass,
) => {
  return injectors
    .filter((eachInjector) =>
      isScopeUnder(eachInjector.scope.node.path, targetInjector.scope),
    )
    .sort(
      (front, rear) =>
        front.scope.node.path.length - rear.scope.node.path.length,
    );
};

export const commitInjection = (
  parentInjector: TerraformInjectorClass,
): void | Promise<void> => {
  const parentScopePath = parentInjector.scope.node.path;
  const injectors = getInjectorsUnder(parentScopePath);
  if (!parentInjector.useAsync) {
    injectors.forEach((eachInjector) => {
      if (eachInjector.useAsync && !eachInjector.isInjected) {
        throw new TerraformInjectorConflictedInjectingMethodTypeError(
          `Synchronous injector on ${parentScopePath} cannot commit cascading injection on nested asynchronous injector on ${eachInjector.scope.node.path}. You should call "inject" function of nested one, or wrap the parent with async injector.`,
        );
      }
    });
  }

  const elementContainerSet = new Set(
    injectors
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
            const newDepContainer = await topContainer.injectAsync(
              getInjectorsUpper(injectors, topContainer.injector),
            );
            if (!newDepContainer) continue;
            if (isScopeUnder(parentScopePath, newDepContainer.scope))
              elementContainerSet.add(newDepContainer);
            else
              throw new TerraformInjectorInvalidScopePathError(
                parentInjector.scope,
                topContainer,
                newDepContainer,
              );
            if (topContainer == newDepContainer)
              throw new TerraformInjectorElementContainerSelfDependenceError(
                `${topContainer.name} is self-dependent. You cannot use its own element when you configure the container.`,
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
          for (const eachAfterDependencyInjectedCallbackContainer of eachContainer.afterDependenciesInjectedCallbackContainerArray) {
            if (!eachAfterDependencyInjectedCallbackContainer.isCalled) {
              await eachAfterDependencyInjectedCallbackContainer.callback(
                eachContainer.element,
                eachContainer.shared,
              );
              eachAfterDependencyInjectedCallbackContainer.isCalled = true;
            }
          }
        if (
          !getInjectorsUnder(parentScopePath).every(
            (eachChild) => eachChild.isInjected,
          )
        )
          await commitInjection(parentInjector);
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
      const newDepContainer = topContainer.inject(
        getInjectorsUpper(injectors, topContainer.injector),
      );
      if (!newDepContainer) continue;
      if (isScopeUnder(parentScopePath, newDepContainer.scope))
        elementContainerSet.add(newDepContainer);
      else
        throw new TerraformInjectorInvalidScopePathError(
          parentInjector.scope,
          topContainer,
          newDepContainer,
        );
      if (topContainer == newDepContainer)
        throw new TerraformInjectorElementContainerSelfDependenceError(
          `${topContainer.name} is self-dependent. You cannot use its own element when you configure the container.`,
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
    for (const eachAfterDependencyInjectedCallbackContainer of eachContainer.afterDependenciesInjectedCallbackContainerArray) {
      if (!eachAfterDependencyInjectedCallbackContainer.isCalled) {
        void eachAfterDependencyInjectedCallbackContainer.callback(
          eachContainer.element,
          eachContainer.shared,
        );
        eachAfterDependencyInjectedCallbackContainer.isCalled = true;
      }
    }

  if (
    !getInjectorsUnder(parentScopePath).every(
      (eachChild) => eachChild.isInjected,
    )
  )
    void commitInjection(parentInjector);
};
