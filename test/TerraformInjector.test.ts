import { App, LocalBackend, Testing, TerraformOutput } from 'cdktf';
import 'cdktf/lib/testing/adapters/jest';
Testing.setupJest();
import { MockElement } from './util';
import {
  TerraformInjector,
  TerraformInjectorStack,
  TerraformInjectorStackAsync,
  TerraformInjectorFactory,
} from '../src';
import {
  injectorMap,
  TerraformInjectorConflictedElementIdError,
  TerraformInjectorConflictedInjectingMethodTypeError,
  TerraformInjectorElementContainer,
  TerraformInjectorElementContainerDependencyCycleError,
  TerraformInjectorElementContainerSelfDependenceError,
  TerraformInjectorInvalidScopePathError,
  TerraformLazyElement,
  TerraformLazyElementAsync,
} from '../src/module';

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
    describe('asynchronous root injector', () => {
      let rootInjectorStack: TerraformInjectorStackAsync;
      beforeEach(() => {
        rootInjectorStack = new TerraformInjectorStackAsync(
          testingApplication,
          'async-root-stack',
        );
      });

      it(`should resolve when the stack is empty`, async () => {
        await expect(rootInjectorStack.inject()).resolves.toBeUndefined();
      });

      it(`should initialize a provided element`, async () => {
        const mockElementContainer = rootInjectorStack.provide(
          MockElement,
          'async-mock-resource',
          async () => ({}),
        );
        await rootInjectorStack.inject();
        expect(mockElementContainer.element).toBeInstanceOf(MockElement);
      });

      it(`should resolve an async dependency between two elements`, async () => {
        const dependentStack = new (class extends TerraformInjectorStackAsync {
          first = this.provide(MockElement, 'first', async () => ({}));
          second = this.provide(MockElement, 'second', async () => {
            this.first.element;
            return { labels: { dependsOn: this.first.element.node.id } };
          });
        })(testingApplication, 'async-dep-stack');

        await dependentStack.inject();
        expect(dependentStack.second.element.config?.labels?.dependsOn).toBe(
          'first',
        );
      });

      it(`should throw ${TerraformInjectorElementContainerSelfDependenceError.name} for self-reference`, async () => {
        const selfDependentStack =
          new (class extends TerraformInjectorStackAsync {
            mockElement = this.provide(MockElement, 'self', async () => {
              this.mockElement.element;
              return {};
            });
          })(testingApplication, 'async-self-ref');

        await expect(selfDependentStack.inject()).rejects.toThrow(
          TerraformInjectorElementContainerSelfDependenceError,
        );
      });
    });
  });

  describe('provideLazily', () => {
    it(`should create nested elements on a sync injector`, () => {
      const stack = new TerraformInjectorStack(
        testingApplication,
        'lazy-sync-stack',
      );
      const lazyContainer = stack.provideLazily(
        MockElement,
        'lazy-parent',
        () => [
          { id: 'nested-a', configure: () => ({ labels: { name: 'a' } }) },
          { id: 'nested-b', configure: () => ({ labels: { name: 'b' } }) },
        ],
      );

      stack.inject();

      expect(lazyContainer.element).toBeInstanceOf(TerraformLazyElement);
      expect(lazyContainer.element.nested).toHaveLength(2);
      expect(lazyContainer.element.nested[0].element.config?.labels?.name).toBe(
        'a',
      );
      expect(lazyContainer.element.nested[1].element.config?.labels?.name).toBe(
        'b',
      );
    });

    it(`should create nested elements on an async injector`, async () => {
      const stack = new TerraformInjectorStackAsync(
        testingApplication,
        'lazy-async-stack',
      );
      const lazyContainer = stack.provideLazily(
        MockElement,
        'lazy-parent',
        () => [
          { id: 'nested-a', configure: async () => ({}) },
          { id: 'nested-b', configure: async () => ({}) },
        ],
      );

      await stack.inject();

      expect(lazyContainer.element).toBeInstanceOf(TerraformLazyElementAsync);
      expect(lazyContainer.element.nested).toHaveLength(2);
      expect(lazyContainer.element.nested[0].element).toBeInstanceOf(
        MockElement,
      );
    });

    it(`should throw ${TerraformInjectorConflictedElementIdError.name} when the lazy id is already used`, () => {
      const stack = new TerraformInjectorStack(
        testingApplication,
        'lazy-conflict-stack',
      );
      stack.provide(MockElement, 'taken', () => ({}));
      expect(() =>
        stack.provideLazily(MockElement, 'taken', () => [
          { id: 'nested', configure: () => ({}) },
        ]),
      ).toThrow(TerraformInjectorConflictedElementIdError);
    });
  });

  describe('setDefaultConfigure', () => {
    it(`should merge the stack default into the user config, with user keys winning`, () => {
      const stack = new TerraformInjectorStack(
        testingApplication,
        'default-stack',
      );
      stack.setDefaultConfigure(() => ({
        labels: { from: 'default', keep: 'default' },
      }));
      const container = stack.provide(MockElement, 'with-user', () => ({
        labels: { from: 'user' },
      }));

      stack.inject();

      expect(container.element.config?.labels).toEqual({
        from: 'user',
        keep: 'default',
      });
    });

    it(`should skip defaultConfigure when useDefaultConfig is false`, () => {
      const stack = new TerraformInjectorStack(
        testingApplication,
        'skip-default-stack',
      );
      stack.setDefaultConfigure(() => ({ labels: { from: 'default' } }));
      const container = stack.provide(
        MockElement,
        'no-default',
        () => ({}),
        false,
      );

      stack.inject();

      expect(container.element.config?.labels).toBeUndefined();
    });

    it(`should apply an app-level default when inject is called on the stack`, () => {
      const appInjector = TerraformInjectorFactory.scopesOn(testingApplication);
      appInjector.setDefaultConfigure(() => ({ labels: { who: 'app' } }));
      const stack = new TerraformInjectorStack(
        testingApplication,
        'stack-only-inject',
      );
      const container = stack.provide(MockElement, 'el', () => ({}));

      stack.inject();

      expect(container.element.config?.labels).toEqual({ who: 'app' });
    });

    it(`should let the stack default overwrite the app default, with user keys winning`, () => {
      const appInjector = TerraformInjectorFactory.scopesOn(testingApplication);
      appInjector.setDefaultConfigure(() => ({
        labels: { who: 'app', extra: 'app' },
      }));
      const stack = new TerraformInjectorStack(
        testingApplication,
        'app-inject-stack',
      );
      stack.setDefaultConfigure(() => ({
        labels: { who: 'stack', extra: 'stack' },
      }));
      const container = stack.provide(MockElement, 'el', () => ({
        labels: { user: 'yes' },
      }));

      appInjector.inject();

      expect(container.element.config?.labels).toEqual({
        who: 'stack',
        extra: 'stack',
        user: 'yes',
      });
    });

    it(`should apply ancestor and stack defaults when inject is called on the stack`, () => {
      const appInjector = TerraformInjectorFactory.scopesOn(testingApplication);
      appInjector.setDefaultConfigure(() => ({
        labels: { who: 'app', rootOnly: 'app' },
      }));
      const stack = new TerraformInjectorStack(
        testingApplication,
        'stack-inject-with-ancestors',
      );
      stack.setDefaultConfigure(() => ({
        labels: { who: 'stack' },
      }));
      const container = stack.provide(MockElement, 'el', () => ({}));

      stack.inject();

      expect(container.element.config?.labels).toEqual({
        who: 'stack',
        rootOnly: 'app',
      });
    });

    it(`should replace arrays from defaultConfigure with the user array`, () => {
      const stack = new TerraformInjectorStack(
        testingApplication,
        'array-merge-stack',
      );
      stack.setDefaultConfigure(() => ({ items: ['default-a', 'default-b'] }));
      const container = stack.provide(MockElement, 'el', () => ({
        items: ['user-a'],
      }));

      stack.inject();

      expect(container.element.config?.items).toEqual(['user-a']);
    });

    it(`should not merge defaultConfigure into a TerraformOutput config`, () => {
      const stack = new TerraformInjectorStack(
        testingApplication,
        'output-default-stack',
      );
      stack.setDefaultConfigure(() => ({ description: 'from-default' }));
      const outputContainer = stack.provide(TerraformOutput, 'out', () => ({
        value: 'plain',
      }));

      stack.inject();

      expect(outputContainer.element.description).toBeUndefined();
    });
  });

  describe('addOutput', () => {
    it(`should provide a TerraformOutput from the element after inject`, () => {
      const stack = new TerraformInjectorStack(
        testingApplication,
        'add-output-stack',
      );
      stack
        .provide(MockElement, 'source', () => ({}))
        .addOutput('source-out', (element) => ({
          value: element.node.id,
        }));

      stack.inject();

      const output = stack.node.tryFindChild('source-out');
      expect(output).toBeInstanceOf(TerraformOutput);
    });

    it(`should accept an output id callback`, () => {
      const stack = new TerraformInjectorStack(
        testingApplication,
        'add-output-id-callback-stack',
      );
      stack
        .provide(MockElement, 'source', () => ({}))
        .addOutput(
          (elementId) => `${elementId}-out`,
          () => ({
            value: 'from-callback',
          }),
        );

      stack.inject();

      expect(stack.node.tryFindChild('source-out')).toBeInstanceOf(
        TerraformOutput,
      );
    });
  });

  describe('backend', () => {
    it(`should initialize a LocalBackend`, () => {
      const stack = new TerraformInjectorStack(
        testingApplication,
        'backend-stack',
      );
      const backendContainer = stack.backend(LocalBackend, () => ({
        path: 'local.state',
      }));

      stack.inject();

      expect(backendContainer.element).toBeInstanceOf(LocalBackend);
    });

    it(`should throw ${TerraformInjectorConflictedElementIdError.name} when a second backend is provided`, () => {
      const stack = new TerraformInjectorStack(
        testingApplication,
        'backend-conflict-stack',
      );
      stack.backend(LocalBackend, () => ({ path: 'first.state' }));
      expect(() =>
        stack.backend(LocalBackend, () => ({ path: 'second.state' })),
      ).toThrow(TerraformInjectorConflictedElementIdError);
    });

    it(`should throw ${TerraformInjectorConflictedElementIdError.name} when provide uses the reserved backend id`, () => {
      const stack = new TerraformInjectorStack(
        testingApplication,
        'backend-reserved-id-stack',
      );
      expect(() => stack.provide(MockElement, 'backend', () => ({}))).toThrow(
        TerraformInjectorConflictedElementIdError,
      );
    });
  });

  describe('element lifecycle hooks', () => {
    it(`should run afterInitElement, onNewElementInjected, then afterDependenciesInjected once each`, () => {
      const stack = new TerraformInjectorStack(
        testingApplication,
        'hook-order-stack',
      );
      const order: string[] = [];
      const first = stack.provide(MockElement, 'first', () => ({}));
      const second = stack.provide(MockElement, 'second', () => {
        first.element;
        return {};
      });

      first.afterInitElement(() => order.push('first-init'));
      first.afterDependenciesInjected(() => order.push('first-deps'));
      second.afterInitElement(() => order.push('second-init'));
      second.afterDependenciesInjected(() => order.push('second-deps'));
      stack.onNewElementInjected((element) =>
        order.push(`new:${element.node.id}`),
      );

      stack.inject();
      stack.inject();

      expect(order).toEqual([
        'first-init',
        'new:first',
        'second-init',
        'new:second',
        'first-deps',
        'second-deps',
      ]);
    });

    it(`should run multiple afterInitElement callbacks in registration order`, () => {
      const stack = new TerraformInjectorStack(
        testingApplication,
        'hook-sequence-stack',
      );
      const order: string[] = [];
      stack
        .provide(MockElement, 'el', () => ({}))
        .afterInitElement(() => order.push('first'))
        .afterInitElement(() => order.push('second'));

      stack.inject();

      expect(order).toEqual(['first', 'second']);
    });
  });

  describe('synth', () => {
    it(`should synth a backend and output through Testing.synthScope`, () => {
      const synthesized = Testing.synthScope((scope) => {
        const injector = TerraformInjectorFactory.scopesOn(scope);
        injector.backend(LocalBackend, () => ({ path: 'local.state' }));
        injector
          .provide(MockElement, 'source', () => ({}))
          .addOutput('source-out', () => ({
            value: 'from-source',
          }));
        injector.inject();
      });

      expect(synthesized).toMatchSnapshot();
      expect(synthesized).toContain('local.state');
      expect(synthesized).toContain('from-source');
    });
  });
});
