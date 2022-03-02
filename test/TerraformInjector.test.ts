import { App, Testing } from 'cdktf';
import 'cdktf/lib/testing/adapters/jest';
Testing.setupJest();
import {
  TerraformInjector,
  TerraformInjectorStack,
  TerraformInjectorStackAsync,
  TerraformInjectorFactory,
} from '../src';
import {
  injectorMap,
  TerraformInjectorConflictedInjectingMethodTypeError,
  TerraformInjectorElementContainer,
  TerraformInjectorElementContainerDependencyCycleError,
  TerraformInjectorElementContainerSelfDependenceError,
  TerraformInjectorInvalidScopePathError,
} from '../src/module';
import { MockElement } from './util';

describe(`Terraform-Injector`, () => {
  let testingApplication: App;
  beforeEach(() => {
    testingApplication = Testing.app();
  });
  afterEach(() => {
    injectorMap.clear();
  });

  describe(`when attempt to load multiple injector on a same scope`, () => {
    let prevInjector: TerraformInjector;
    beforeEach(() => {
      prevInjector = TerraformInjectorFactory.scopesOn(testingApplication);
    });
    describe(`when both injectors using same method type`, () => {
      it(`should not throw ${TerraformInjectorConflictedInjectingMethodTypeError.name}`, () => {
        expect(() =>
          TerraformInjectorFactory.scopesOn(testingApplication),
        ).not.toThrow(TerraformInjectorConflictedInjectingMethodTypeError);
      });
      it(`should be same with original injector`, () => {
        expect(prevInjector).toEqual(
          TerraformInjectorFactory.scopesOn(testingApplication),
        );
      });
    });
    describe(`when two each has different method type from each other`, () => {
      it(`should throw ${TerraformInjectorConflictedInjectingMethodTypeError.name}`, () => {
        expect(() =>
          TerraformInjectorFactory.scopesOnAsync(testingApplication),
        ).toThrow(TerraformInjectorConflictedInjectingMethodTypeError);
      });
    });
  });

  describe('commit cascading injection', () => {
    describe('synchronous root injector', () => {
      let rootInjectorStack: TerraformInjectorStack;
      beforeEach(() => {
        rootInjectorStack = new TerraformInjectorStack(
          testingApplication,
          'root-stack',
        );
      });

      describe(`when including asynchronous injector`, () => {
        let nestedAsyncInjector: TerraformInjectorStackAsync;
        beforeEach(() => {
          nestedAsyncInjector = new TerraformInjectorStackAsync(
            rootInjectorStack,
            'nested-injector',
          );
        });

        describe(`when nested async injector is empty`, () => {
          it(`should not throw any error`, () => {
            expect(() => rootInjectorStack.inject()).not.toThrow(
              TerraformInjectorConflictedInjectingMethodTypeError,
            );
          });
        });

        describe(`when nested async injector includes element`, () => {
          beforeEach(() => {
            nestedAsyncInjector.provide(
              MockElement,
              'mock-resource',
              () => ({}),
            );
          });
          describe('when nested async injector is not initialized', () => {
            it(`should throw ${TerraformInjectorConflictedInjectingMethodTypeError.name}`, () => {
              expect(() => rootInjectorStack.inject()).toThrow(
                TerraformInjectorConflictedInjectingMethodTypeError,
              );
            });
          });
          describe(`when nested async injector is initialized`, () => {
            beforeEach(async () => {
              await nestedAsyncInjector.inject();
            });
            it(`should not throw ${TerraformInjectorConflictedInjectingMethodTypeError.name}`, async () => {
              expect(() => rootInjectorStack.inject()).not.toThrow(
                TerraformInjectorConflictedInjectingMethodTypeError,
              );
            });
          });
        });
      });
      describe(`when including synchronous injector`, () => {
        let nestedInjector: TerraformInjectorStack;
        beforeEach(() => {
          nestedInjector = new TerraformInjectorStack(
            rootInjectorStack,
            `nested-injector`,
          );
        });
        describe(`when no element has any reference`, () => {
          let mockElementContainer: TerraformInjectorElementContainer<
            MockElement,
            {}
          >;
          beforeEach(() => {
            mockElementContainer = nestedInjector.provide(
              MockElement,
              'mock-resource',
              () => ({}),
            );
            rootInjectorStack.inject();
          });
          it(`element should be defined`, () => {
            expect(mockElementContainer.element).not.toBeUndefined();
          });
        });
        describe(`when element has self-def reference`, () => {
          beforeEach(() => {
            nestedInjector = new (class extends TerraformInjectorStack {
              mockElement = this.provide(MockElement, 'mock-element', () => {
                this.mockElement.element;
                return {};
              });
            })(rootInjectorStack, 'nested-injector-with-self-reference');
          });
          it(`should throw ${TerraformInjectorElementContainerSelfDependenceError.name}`, () => {
            expect(() => rootInjectorStack.inject()).toThrow(
              TerraformInjectorElementContainerSelfDependenceError,
            );
          });
        });
        describe(`when element has invalid scope reference`, () => {
          beforeEach(() => {
            const rootInjectorStack2 =
              new (class extends TerraformInjectorStack {
                mockElement = this.provide(
                  MockElement,
                  'mock-element',
                  () => ({}),
                );
              })(testingApplication, 'root-stack2');
            nestedInjector.provide(MockElement, 'mock-element', () => {
              rootInjectorStack2.mockElement.element;
              return {};
            });
          });
          it(`should throw ${TerraformInjectorInvalidScopePathError.name}`, () => {
            expect(() => rootInjectorStack.inject()).toThrow(
              TerraformInjectorInvalidScopePathError,
            );
          });
        });
        describe(`when dependency cycle exists`, () => {
          beforeEach(() => {
            nestedInjector = new (class extends TerraformInjectorStack {
              mockElement1 = this.provide(MockElement, 'mock-element-1', () => {
                this.mockElement2.element;
                return {};
              });
              mockElement2 = this.provide(MockElement, 'mock-element-2', () => {
                this.mockElement1.element;
                return {};
              });
            })(rootInjectorStack, 'nested-injector-with-dep-cycle');
          });
          it(`should throw ${TerraformInjectorElementContainerDependencyCycleError.name}`, () => {
            expect(() => rootInjectorStack.inject()).toThrow(
              TerraformInjectorElementContainerDependencyCycleError,
            );
          });
        });
      });
    });
    describe('asynchronous root injector', () => {});
  });
});
