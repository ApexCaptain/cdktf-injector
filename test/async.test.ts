import { LocalBackend, TerraformOutput } from 'cdktf';
import { MockElement, useTestingApp } from './util';
import {
  TerraformInjectorFactory,
  TerraformInjectorStack,
  TerraformInjectorStackAsync,
} from '../src';
import {
  TerraformInjectorConflictedInjectingMethodTypeError,
  TerraformInjectorElementContainerDependencyCycleError,
  TerraformInjectorElementContainerSelfDependenceError,
  TerraformInjectorInvalidScopePathError,
  TerraformLazyElementAsync,
} from '../src/module';

const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 1));

describe('async injector', () => {
  const app = useTestingApp();
  let stack: TerraformInjectorStackAsync;
  beforeEach(() => {
    stack = new TerraformInjectorStackAsync(app(), 'async-stack');
  });

  describe('basic injection', () => {
    it(`should resolve when empty`, async () => {
      await expect(stack.inject()).resolves.toBeUndefined();
    });

    it(`should await an async configure`, async () => {
      const container = stack.provide(MockElement, 'el', async () => {
        await tick();
        return { labels: { a: '1' } };
      });
      await stack.inject();
      expect(container.element.config?.labels?.a).toBe('1');
    });

    it(`should accept a sync configure`, async () => {
      const container = stack.provide(MockElement, 'el', () => ({}));
      await stack.inject();
      expect(container.element).toBeInstanceOf(MockElement);
    });

    it(`should split an async [config, shared] tuple`, async () => {
      const container = stack.provide(MockElement, 'el', async () => [
        {},
        'shared',
      ]);
      await stack.inject();
      expect(container.shared).toBe('shared');
    });

    it(`should resolve a dependency across awaits`, async () => {
      const holder: Record<string, any> = {};
      holder.second = stack.provide(MockElement, 'second', async () => {
        await tick();
        return { labels: { dep: holder.first.element.node.id } };
      });
      holder.first = stack.provide(MockElement, 'first', async () => {
        await tick();
        return {};
      });
      await stack.inject();
      expect(holder.second.element.config.labels.dep).toBe('first');
    });

    it(`should not recreate elements on a second inject`, async () => {
      const configure = jest.fn(async () => ({}));
      const container = stack.provide(MockElement, 'el', configure);
      await stack.inject();
      const element = container.element;
      await stack.inject();
      expect(container.element).toBe(element);
      expect(configure).toHaveBeenCalledTimes(1);
    });
  });

  describe('failures', () => {
    it(`should reject with the configure error`, async () => {
      stack.provide(MockElement, 'el', async () => {
        throw new RangeError('boom');
      });
      await expect(stack.inject()).rejects.toThrow(RangeError);
    });

    it(`should reject with ${TerraformInjectorElementContainerSelfDependenceError.name}`, async () => {
      const self: any = stack.provide(MockElement, 'self', async () => {
        self.element;
        return {};
      });
      await expect(stack.inject()).rejects.toThrow(
        TerraformInjectorElementContainerSelfDependenceError,
      );
    });

    it(`should reject with ${TerraformInjectorElementContainerDependencyCycleError.name}`, async () => {
      const holder: Record<string, any> = {};
      holder.a = stack.provide(MockElement, 'a', async () => {
        holder.b.element;
        return {};
      });
      holder.b = stack.provide(MockElement, 'b', async () => {
        holder.a.element;
        return {};
      });
      await expect(stack.inject()).rejects.toThrow(
        TerraformInjectorElementContainerDependencyCycleError,
      );
    });

    it(`should reject with ${TerraformInjectorInvalidScopePathError.name}`, async () => {
      const sibling = new TerraformInjectorStackAsync(app(), 'sibling');
      const siblingEl = sibling.provide(MockElement, 'el', async () => ({}));
      stack.provide(MockElement, 'el', async () => {
        siblingEl.element;
        return {};
      });
      await expect(stack.inject()).rejects.toThrow(
        TerraformInjectorInvalidScopePathError,
      );
    });

    it(`should reject when an afterInitElement callback rejects`, async () => {
      stack
        .provide(MockElement, 'el', async () => ({}))
        .afterInitElement(async () => {
          throw new RangeError('after-init');
        });
      await expect(stack.inject()).rejects.toThrow('after-init');
    });

    it(`should reject when an afterDependenciesInjected callback rejects`, async () => {
      stack
        .provide(MockElement, 'el', async () => ({}))
        .afterDependenciesInjected(async () => {
          throw new RangeError('after-deps');
        });
      await expect(stack.inject()).rejects.toThrow('after-deps');
    });
  });

  describe('callback ordering', () => {
    it(`should finish an async afterInitElement before creating the next element`, async () => {
      const order: string[] = [];
      stack
        .provide(MockElement, 'first', async () => ({}))
        .afterInitElement(async () => {
          await tick();
          order.push('first-init-done');
        });
      stack.provide(MockElement, 'second', async () => {
        order.push('second-configure');
        return {};
      });
      await stack.inject();
      expect(order).toEqual(['first-init-done', 'second-configure']);
    });

    it(`should finish afterDependenciesInjected before inject resolves`, async () => {
      let done = false;
      stack
        .provide(MockElement, 'el', async () => ({}))
        .afterDependenciesInjected(async () => {
          await tick();
          done = true;
        });
      await stack.inject();
      expect(done).toBe(true);
    });

    it(`should await a late afterInitElement on the next inject`, async () => {
      const container = stack.provide(MockElement, 'el', async () => ({}));
      await stack.inject();
      let done = false;
      container.afterInitElement(async () => {
        await tick();
        done = true;
      });
      await stack.inject();
      expect(done).toBe(true);
    });

    it(`should inject an element provided from afterDependenciesInjected`, async () => {
      let late: any;
      stack
        .provide(MockElement, 'el', async () => ({}))
        .afterDependenciesInjected(async () => {
          late = stack.provide(MockElement, 'late', async () => ({}));
        });
      await stack.inject();
      expect(late.element).toBeInstanceOf(MockElement);
    });
  });

  describe('stack API', () => {
    it(`should set a backend`, async () => {
      const backend = stack.backend(LocalBackend, async () => ({
        path: 'async.state',
      }));
      await stack.inject();
      expect(backend.element).toBeInstanceOf(LocalBackend);
    });

    it(`should apply setDefaultConfigure`, async () => {
      stack.setDefaultConfigure(() => ({ labels: { d: 'default' } }));
      const container = stack.provide(MockElement, 'el', async () => ({}));
      await stack.inject();
      expect(container.element.config?.labels).toEqual({ d: 'default' });
    });

    it(`should call onNewElementInjected`, async () => {
      const seen: string[] = [];
      stack.onNewElementInjected((element) => seen.push(element.node.id));
      stack.provide(MockElement, 'el', async () => ({}));
      await stack.inject();
      expect(seen).toEqual(['el']);
    });

    it(`should provide lazily`, async () => {
      const lazy = stack.provideLazily(MockElement, 'lazy', () => [
        { id: 'n', configure: async () => ({}) },
      ]);
      await stack.inject();
      expect(lazy.element).toBeInstanceOf(TerraformLazyElementAsync);
      expect(lazy.element.nested[0].element).toBeInstanceOf(MockElement);
    });

    it(`should add an output`, async () => {
      stack
        .provide(MockElement, 'el', async () => ({}))
        .addOutput('el-out', (element) => ({ value: element.node.id }));
      await stack.inject();
      expect(stack.node.tryFindChild('el-out')).toBeInstanceOf(TerraformOutput);
    });

    it(`should return itself from chainable setters`, () => {
      expect(stack.setDefaultConfigure(() => ({}))).toBe(stack);
      expect(stack.onNewElementInjected(() => undefined)).toBe(stack);
    });
  });
});

describe('mixing sync and async injectors', () => {
  const app = useTestingApp();

  describe('sync root with a nested async injector', () => {
    let root: TerraformInjectorStack;
    let nestedAsync: TerraformInjectorStackAsync;
    beforeEach(() => {
      root = new TerraformInjectorStack(app(), 'root');
      nestedAsync = new TerraformInjectorStackAsync(root, 'nested');
    });

    it(`should allow inject when the nested async injector is empty`, () => {
      expect(() => root.inject()).not.toThrow();
    });

    it(`should throw ${TerraformInjectorConflictedInjectingMethodTypeError.name} when the nested async injector is pending`, () => {
      nestedAsync.provide(MockElement, 'el', async () => ({}));
      expect(() => root.inject()).toThrow(
        TerraformInjectorConflictedInjectingMethodTypeError,
      );
    });

    it(`should allow inject after the nested async injector was injected`, async () => {
      const nestedEl = nestedAsync.provide(MockElement, 'el', async () => ({}));
      const rootEl = root.provide(MockElement, 'el', () => ({}));
      await nestedAsync.inject();
      root.inject();
      expect(nestedEl.element).toBeInstanceOf(MockElement);
      expect(rootEl.element).toBeInstanceOf(MockElement);
    });

    it(`should throw again once the nested async injector gets a new pending element`, async () => {
      await nestedAsync.inject();
      nestedAsync.provide(MockElement, 'late', async () => ({}));
      expect(() => root.inject()).toThrow(
        TerraformInjectorConflictedInjectingMethodTypeError,
      );
    });
  });

  it(`should throw when a nested async injector has a pending late afterInitElement`, async () => {
    const root = new TerraformInjectorStack(app(), 'root');
    const nestedAsync = new TerraformInjectorStackAsync(root, 'nested');
    const container = nestedAsync.provide(MockElement, 'el', async () => ({}));
    await nestedAsync.inject();
    container.afterInitElement(async () => undefined);
    expect(() => root.inject()).toThrow(
      TerraformInjectorConflictedInjectingMethodTypeError,
    );
  });

  describe('async root with a nested sync injector', () => {
    it(`should inject both, including a cross-scope dependency`, async () => {
      const root = new TerraformInjectorStackAsync(app(), 'root');
      const nestedSync = new TerraformInjectorStack(root, 'nested');
      const rootEl = root.provide(MockElement, 'root-el', async () => ({}));
      const nestedEl = nestedSync.provide(MockElement, 'nested-el', () => ({
        labels: { root: rootEl.element.node.id },
      }));
      await root.inject();
      expect(nestedEl.element.config?.labels?.root).toBe('root-el');
    });
  });

  it(`should inject a nested async injector from an async App-level injector`, async () => {
    const appInjector = TerraformInjectorFactory.scopesOnAsync(app());
    const nested = new TerraformInjectorStackAsync(app(), 'nested');
    const el = nested.provide(MockElement, 'el', async () => ({}));
    await appInjector.inject();
    expect(el.element).toBeInstanceOf(MockElement);
  });
});
