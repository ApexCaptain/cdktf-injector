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

/**
 * Whether `targetScope` is `stdPath` itself or one of its descendants.
 * An empty `stdPath` is the App root, which contains every scope.
 */
const isScopeUnder = (stdPath: string, targetScope: Construct) => {
  return stdPath === ''
    ? true
    : targetScope.node.path
        .split('/')
        .slice(0, stdPath.split('/').length)
        .join('/') == stdPath;
};

/** Every registered injector whose scope is at or below `rootScopePath`. */
const getInjectorsUnder = (rootScopePath: string) => {
  const injectors = Array.from(injectorMap.values());
  return Array.from(
    injectors.filter((eachInjector) =>
      isScopeUnder(rootScopePath, eachInjector.scope),
    ),
  );
};

/**
 * Injectors on the target's scope and all its ancestor scopes, ordered root first.
 * The order matters: default configs are merged in this order, so the closest scope wins.
 */
const getInjectorsUpper = (targetInjector: TerraformInjectorClass) => {
  const ancestors = new Array<TerraformInjectorClass>();
  let current: Construct | undefined = targetInjector.scope;
  while (current) {
    const found = injectorMap.get(current);
    if (found) {
      ancestors.push(found);
    }
    current = current.node.scope as Construct | undefined;
  }
  return ancestors.sort(
    (front, rear) => front.scope.node.path.length - rear.scope.node.path.length,
  );
};

/**
 * Instantiates every pending element under `parentInjector`'s scope.
 *
 * Dependencies are discovered at runtime rather than declared: a container's configure
 * callback is simply called, and if it reads `.element` / `.shared` of a container that is
 * not initialized yet, that access throws `TerraformInjectorElementContainerUninitializedError`.
 * The container returns the missing dependency, which is pushed on a DFS stack and resolved
 * first. The stack doubles as the current dependency path, so seeing a container on it twice
 * means a cycle.
 *
 * The sync and async branches run the same algorithm; only the awaiting differs.
 */
export const commitInjection = (
  parentInjector: TerraformInjectorClass,
): void | Promise<void> => {
  const parentScopePath = parentInjector.scope.node.path;
  const injectors = getInjectorsUnder(parentScopePath);
  // A sync commit cannot await async configure callbacks, so a pending nested async
  // injector must be injected on its own first.
  if (!parentInjector.useAsync) {
    injectors.forEach((eachInjector) => {
      if (eachInjector.useAsync && !eachInjector.isInjected) {
        throw new TerraformInjectorConflictedInjectingMethodTypeError(
          `Synchronous injector on ${parentScopePath} cannot commit cascading injection on nested asynchronous injector on ${eachInjector.scope.node.path}. You should call "inject" function of nested one, or wrap the parent with async injector.`,
        );
      }
    });
  }

  // Iterating a Set visits entries added during iteration, so dependencies found mid-loop
  // are processed in the same pass. Containers registered during injection (e.g. by lazy
  // elements) are not in this set; the re-pass at the end picks them up.
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
              getInjectorsUpper(topContainer.injector),
            );
            // Initialized: notify the owning injector and pop back to its dependent.
            if (!newDepContainer) {
              topContainer.injector.onNewElementInjectedCallbackArray.forEach(
                (eachCallback) => eachCallback(topContainer.element),
              );
              continue;
            }
            if (isScopeUnder(parentScopePath, newDepContainer.scope)) {
              elementContainerSet.add(newDepContainer);
            } else {
              throw new TerraformInjectorInvalidScopePathError(
                parentInjector.scope,
                topContainer,
                newDepContainer,
              );
            }
            if (topContainer == newDepContainer) {
              throw new TerraformInjectorElementContainerSelfDependenceError(
                `${topContainer.name} is self-dependent. You cannot use its own element when you configure the container.`,
              );
            }
            // Retry topContainer after its dependency. If the dependency is already on
            // the path below it, the slice between the two is the cycle.
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
        // Every element exists now, so afterDependenciesInjected callbacks can read any of them.
        for (const eachContainer of elementContainerSet) {
          for (const eachAfterDependencyInjectedCallbackContainer of eachContainer.afterDependenciesInjectedCallbackContainerArray) {
            if (!eachAfterDependencyInjectedCallbackContainer.isCalled) {
              await eachAfterDependencyInjectedCallbackContainer.callback(
                eachContainer.element,
                eachContainer.shared,
              );
              eachAfterDependencyInjectedCallbackContainer.isCalled = true;
            }
          }
        }
        // Callbacks may have provided new elements or created new injectors; run another
        // pass until nothing under the scope is pending.
        if (
          !getInjectorsUnder(parentScopePath).every(
            (eachChild) => eachChild.isInjected,
          )
        ) {
          await commitInjection(parentInjector);
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Synchronous path: same steps as above without awaiting.
  for (const eachContainer of elementContainerSet) {
    if (eachContainer.isInitialized) continue;
    containerDependencyCycleStack.push(eachContainer);
    while (containerDependencyCycleStack.length) {
      const topContainer = containerDependencyCycleStack.pop()!;
      const newDepContainer = topContainer.inject(
        getInjectorsUpper(topContainer.injector),
      );
      if (!newDepContainer) {
        topContainer.injector.onNewElementInjectedCallbackArray.forEach(
          (eachCallback) => eachCallback(topContainer.element),
        );
        continue;
      }
      if (isScopeUnder(parentScopePath, newDepContainer.scope)) {
        elementContainerSet.add(newDepContainer);
      } else {
        throw new TerraformInjectorInvalidScopePathError(
          parentInjector.scope,
          topContainer,
          newDepContainer,
        );
      }
      if (topContainer == newDepContainer) {
        throw new TerraformInjectorElementContainerSelfDependenceError(
          `${topContainer.name} is self-dependent. You cannot use its own element when you configure the container.`,
        );
      }
      containerDependencyCycleStack.push(topContainer, newDepContainer);
      const cyclePoint = containerDependencyCycleStack.indexOf(newDepContainer);
      if (cyclePoint != containerDependencyCycleStack.length - 1) {
        throw new TerraformInjectorElementContainerDependencyCycleError(
          containerDependencyCycleStack.slice(cyclePoint, -1),
        );
      }
    }
  }
  for (const eachContainer of elementContainerSet) {
    for (const eachAfterDependencyInjectedCallbackContainer of eachContainer.afterDependenciesInjectedCallbackContainerArray) {
      if (!eachAfterDependencyInjectedCallbackContainer.isCalled) {
        void eachAfterDependencyInjectedCallbackContainer.callback(
          eachContainer.element,
          eachContainer.shared,
        );
        eachAfterDependencyInjectedCallbackContainer.isCalled = true;
      }
    }
  }

  if (
    !getInjectorsUnder(parentScopePath).every(
      (eachChild) => eachChild.isInjected,
    )
  ) {
    void commitInjection(parentInjector);
  }
};
