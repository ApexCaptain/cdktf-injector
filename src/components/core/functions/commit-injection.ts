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
 * Whether `targetScope` is `ancestorScope` itself or one of its descendants.
 * Compares construct identity, not path strings: two Apps in one process can hold
 * constructs with identical paths, and those must not be mixed.
 */
const isScopeUnder = (ancestorScope: Construct, targetScope: Construct) => {
  let current: Construct | undefined = targetScope;
  while (current) {
    if (current === ancestorScope) return true;
    current = current.node.scope;
  }
  return false;
};

/** Every registered injector whose scope is `rootScope` or below it. */
const getInjectorsUnder = (rootScope: Construct) =>
  Array.from(injectorMap.values()).filter((eachInjector) =>
    isScopeUnder(rootScope, eachInjector.scope),
  );

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
  const parentScope = parentInjector.scope;
  const parentScopePath = parentScope.node.path;
  const injectors = getInjectorsUnder(parentScope);
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
          if (eachContainer.isSettled) continue;
          containerDependencyCycleStack.push(eachContainer);
          while (containerDependencyCycleStack.length) {
            const topContainer = containerDependencyCycleStack.pop()!;
            const newDepContainer = await topContainer.injectAsync(
              getInjectorsUpper(topContainer.injector),
            );
            // Done: notify the owning injector (once per element) and pop back to its dependent.
            if (!newDepContainer) {
              if (!topContainer.isNewElementNotified) {
                topContainer.isNewElementNotified = true;
                topContainer.injector.onNewElementInjectedCallbackArray.forEach(
                  (eachCallback) => eachCallback(topContainer.element),
                );
              }
              continue;
            }
            if (isScopeUnder(parentScope, newDepContainer.scope)) {
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
          !getInjectorsUnder(parentScope).every(
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

  // Synchronous path: same steps as above without awaiting. A Promise from any user
  // callback is rejected by `throwIfPromise`, since nothing here could await it.
  for (const eachContainer of elementContainerSet) {
    if (eachContainer.isSettled) continue;
    containerDependencyCycleStack.push(eachContainer);
    while (containerDependencyCycleStack.length) {
      const topContainer = containerDependencyCycleStack.pop()!;
      const newDepContainer = topContainer.inject(
        getInjectorsUpper(topContainer.injector),
      );
      if (!newDepContainer) {
        if (!topContainer.isNewElementNotified) {
          topContainer.isNewElementNotified = true;
          topContainer.injector.onNewElementInjectedCallbackArray.forEach(
            (eachCallback) =>
              topContainer.throwIfPromise(
                eachCallback(topContainer.element),
                'onNewElementInjected',
              ),
          );
        }
        continue;
      }
      if (isScopeUnder(parentScope, newDepContainer.scope)) {
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
        void eachContainer.throwIfPromise(
          eachAfterDependencyInjectedCallbackContainer.callback(
            eachContainer.element,
            eachContainer.shared,
          ),
          'afterDependenciesInjected',
        );
        eachAfterDependencyInjectedCallbackContainer.isCalled = true;
      }
    }
  }

  if (
    !getInjectorsUnder(parentScope).every((eachChild) => eachChild.isInjected)
  ) {
    void commitInjection(parentInjector);
  }
};
