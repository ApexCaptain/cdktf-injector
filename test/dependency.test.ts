import { MockElement, useTestingApp } from './util';
import {
  TerraformInjectorElementContainer,
  TerraformInjectorFactory,
  TerraformInjectorStack,
} from '../src';
import {
  TerraformInjectorConflictedElementIdError,
  TerraformInjectorElementContainerDependencyCycleError,
  TerraformInjectorElementContainerSelfDependenceError,
  TerraformInjectorElementContainerUninitializedError,
  TerraformInjectorInvalidScopePathError,
} from '../src/module';

describe('dependency resolution (sync)', () => {
  const app = useTestingApp();
  let stack: TerraformInjectorStack;
  beforeEach(() => {
    stack = new TerraformInjectorStack(app(), 'stack');
  });

  describe('before inject', () => {
    it(`should throw ${TerraformInjectorElementContainerUninitializedError.name} when reading element`, () => {
      const container = stack.provide(MockElement, 'el', () => ({}));
      expect(() => container.element).toThrow(
        TerraformInjectorElementContainerUninitializedError,
      );
    });

    it(`should throw ${TerraformInjectorElementContainerUninitializedError.name} when reading shared`, () => {
      const container = stack.provide(MockElement, 'el', () => ({}));
      expect(() => container.shared).toThrow(
        TerraformInjectorElementContainerUninitializedError,
      );
    });

    it(`should not call configure at registration time`, () => {
      const configure = jest.fn(() => ({}));
      stack.provide(MockElement, 'el', configure);
      expect(configure).not.toHaveBeenCalled();
    });

    it(`should throw ${TerraformInjectorConflictedElementIdError.name} for a duplicate id`, () => {
      stack.provide(MockElement, 'el', () => ({}));
      expect(() => stack.provide(MockElement, 'el', () => ({}))).toThrow(
        TerraformInjectorConflictedElementIdError,
      );
    });

    it(`should allow the same id in different scopes`, () => {
      const other = new TerraformInjectorStack(app(), 'other');
      const a = stack.provide(MockElement, 'el', () => ({}));
      const b = other.provide(MockElement, 'el', () => ({}));
      TerraformInjectorFactory.scopesOn(app()).inject();
      expect(a.element).not.toBe(b.element);
    });
  });

  describe('configure callback', () => {
    it(`should receive the element id`, () => {
      const configure = jest.fn(() => ({}));
      stack.provide(MockElement, 'my-id', configure);
      stack.inject();
      expect(configure).toHaveBeenCalledWith('my-id');
    });

    it(`should pass a plain config to the element constructor`, () => {
      const container = stack.provide(MockElement, 'el', () => ({
        labels: { a: '1' },
      }));
      stack.inject();
      expect(container.element.config).toEqual({ labels: { a: '1' } });
      expect(container.shared).toBeUndefined();
    });

    it(`should split a [config, shared] tuple`, () => {
      const container = stack.provide(MockElement, 'el', () => [
        { labels: { a: '1' } },
        { extra: 42 },
      ]);
      stack.inject();
      expect(container.element.config).toEqual({ labels: { a: '1' } });
      expect(container.shared).toEqual({ extra: 42 });
    });

    it(`should create the element in the injector's scope with the given id`, () => {
      const container = stack.provide(MockElement, 'el', () => ({}));
      stack.inject();
      expect(container.element.node.scope).toBe(stack);
      expect(container.element.node.id).toBe('el');
    });

    it(`should propagate a non-injector error thrown by configure`, () => {
      stack.provide(MockElement, 'el', () => {
        throw new RangeError('boom');
      });
      expect(() => stack.inject()).toThrow(RangeError);
    });

    it(`should call configure once when dependencies are already initialized`, () => {
      const first = stack.provide(MockElement, 'first', () => ({}));
      const configure = jest.fn(() => {
        first.element;
        return {};
      });
      stack.provide(MockElement, 'second', configure);
      stack.inject();
      expect(configure).toHaveBeenCalledTimes(1);
    });

    // Documents the discovery mechanism: a dependent visited before its dependency is retried.
    it(`should re-run configure of a dependent registered before its dependency`, () => {
      let first: TerraformInjectorElementContainer<MockElement, undefined>;
      const configure = jest.fn(() => {
        first.element;
        return {};
      });
      stack.provide(MockElement, 'second', configure);
      first = stack.provide(MockElement, 'first', () => ({}));
      stack.inject();
      expect(configure).toHaveBeenCalledTimes(2);
    });
  });

  describe('dependency graph shapes', () => {
    it(`should resolve a chain registered in reverse order`, () => {
      const order: string[] = [];
      const holder: Record<string, any> = {};
      holder.c = stack.provide(MockElement, 'c', () => {
        holder.b.element;
        order.push('c');
        return {};
      });
      holder.b = stack.provide(MockElement, 'b', () => {
        holder.a.element;
        order.push('b');
        return {};
      });
      holder.a = stack.provide(MockElement, 'a', () => {
        order.push('a');
        return {};
      });

      stack.inject();

      expect(order).toEqual(['a', 'b', 'c']);
    });

    it(`should resolve a diamond and create the shared dependency once`, () => {
      const created = jest.fn();
      stack.onNewElementInjected((element) => created(element.node.id));
      const holder: Record<string, any> = {};
      holder.d = stack.provide(MockElement, 'd', () => {
        holder.b.element;
        holder.c.element;
        return {};
      });
      holder.b = stack.provide(MockElement, 'b', () => {
        holder.a.element;
        return {};
      });
      holder.c = stack.provide(MockElement, 'c', () => {
        holder.a.element;
        return {};
      });
      holder.a = stack.provide(MockElement, 'a', () => ({}));

      stack.inject();

      expect(created.mock.calls.map(([id]) => id).sort()).toEqual([
        'a',
        'b',
        'c',
        'd',
      ]);
    });

    it(`should let configure read a dependency's shared value`, () => {
      const source = stack.provide(MockElement, 'source', () => [
        {},
        'shared-value',
      ]);
      const target = stack.provide(MockElement, 'target', () => ({
        labels: { from: source.shared },
      }));
      stack.inject();
      expect(target.element.config?.labels?.from).toBe('shared-value');
    });

    it(`should resolve a nested-scope element depending on its parent scope`, () => {
      const nested = new TerraformInjectorStack(stack, 'nested');
      const parentEl = stack.provide(MockElement, 'parent', () => ({}));
      const childEl = nested.provide(MockElement, 'child', () => ({
        labels: { parent: parentEl.element.node.id },
      }));
      stack.inject();
      expect(childEl.element.config?.labels?.parent).toBe('parent');
    });

    it(`should resolve a parent-scope element depending on a nested scope`, () => {
      const nested = new TerraformInjectorStack(stack, 'nested');
      const childEl = nested.provide(MockElement, 'child', () => ({}));
      const parentEl = stack.provide(MockElement, 'parent', () => ({
        labels: { child: childEl.element.node.id },
      }));
      stack.inject();
      expect(parentEl.element.config?.labels?.child).toBe('child');
    });
  });

  describe('invalid graphs', () => {
    it(`should throw ${TerraformInjectorElementContainerSelfDependenceError.name} for self-reference`, () => {
      const self: any = stack.provide(MockElement, 'self', () => {
        self.element;
        return {};
      });
      expect(() => stack.inject()).toThrow(
        TerraformInjectorElementContainerSelfDependenceError,
      );
    });

    it(`should throw ${TerraformInjectorElementContainerDependencyCycleError.name} for a 2-cycle`, () => {
      const holder: Record<string, any> = {};
      holder.a = stack.provide(MockElement, 'a', () => {
        holder.b.element;
        return {};
      });
      holder.b = stack.provide(MockElement, 'b', () => {
        holder.a.element;
        return {};
      });
      expect(() => stack.inject()).toThrow(
        TerraformInjectorElementContainerDependencyCycleError,
      );
    });

    it(`should name every member of a 3-cycle in the error message`, () => {
      const holder: Record<string, any> = {};
      holder.a = stack.provide(MockElement, 'a', () => {
        holder.b.element;
        return {};
      });
      holder.b = stack.provide(MockElement, 'b', () => {
        holder.c.element;
        return {};
      });
      holder.c = stack.provide(MockElement, 'c', () => {
        holder.a.element;
        return {};
      });

      let message = '';
      try {
        stack.inject();
      } catch (error) {
        expect(error).toBeInstanceOf(
          TerraformInjectorElementContainerDependencyCycleError,
        );
        message = (error as Error).message;
      }
      expect(message).toContain('There are 3 elements trapped');
      for (const id of ['a', 'b', 'c']) {
        expect(message).toContain(`<MockElement ${id}>`);
        expect(message).toContain(`Scope path : stack/${id}`);
      }
    });

    it.each([undefined, 1, 10])(
      `should build the cycle message when terminal columns is %p`,
      (columns) => {
        const descriptor = Object.getOwnPropertyDescriptor(
          process.stdout,
          'columns',
        );
        Object.defineProperty(process.stdout, 'columns', {
          value: columns,
          configurable: true,
        });
        try {
          const holder: Record<string, any> = {};
          holder.a = stack.provide(MockElement, 'a', () => {
            holder.b.element;
            return {};
          });
          holder.b = stack.provide(MockElement, 'b', () => {
            holder.a.element;
            return {};
          });
          expect(() => stack.inject()).toThrow(
            TerraformInjectorElementContainerDependencyCycleError,
          );
        } finally {
          if (descriptor) {
            Object.defineProperty(process.stdout, 'columns', descriptor);
          } else {
            delete (process.stdout as any).columns;
          }
        }
      },
    );

    it(`should not flag a cycle when two elements share a dependency`, () => {
      const holder: Record<string, any> = {};
      holder.a = stack.provide(MockElement, 'a', () => {
        holder.c.element;
        return {};
      });
      holder.b = stack.provide(MockElement, 'b', () => {
        holder.c.element;
        holder.a.element;
        return {};
      });
      holder.c = stack.provide(MockElement, 'c', () => ({}));
      expect(() => stack.inject()).not.toThrow();
    });

    it(`should throw ${TerraformInjectorInvalidScopePathError.name} for a dependency in a sibling stack`, () => {
      const sibling = new TerraformInjectorStack(app(), 'sibling');
      const siblingEl = sibling.provide(MockElement, 'el', () => ({}));
      stack.provide(MockElement, 'el', () => {
        siblingEl.element;
        return {};
      });
      expect(() => stack.inject()).toThrow(
        TerraformInjectorInvalidScopePathError,
      );
    });

    it(`should throw ${TerraformInjectorInvalidScopePathError.name} when only the nested scope is injected but it depends on the parent`, () => {
      const nested = new TerraformInjectorStack(stack, 'nested');
      const parentEl = stack.provide(MockElement, 'parent', () => ({}));
      nested.provide(MockElement, 'child', () => {
        parentEl.element;
        return {};
      });
      expect(() => nested.inject()).toThrow(
        /stack\/parent is not under the scope path <stack\/nested>/,
      );
    });
  });

  describe('repeated inject', () => {
    it(`should not recreate elements on a second inject`, () => {
      const configure = jest.fn(() => ({}));
      const container = stack.provide(MockElement, 'el', configure);
      stack.inject();
      const element = container.element;
      stack.inject();
      expect(container.element).toBe(element);
      expect(configure).toHaveBeenCalledTimes(1);
    });

    it(`should create elements provided after the first inject`, () => {
      stack.inject();
      const late = stack.provide(MockElement, 'late', () => ({}));
      stack.inject();
      expect(late.element).toBeInstanceOf(MockElement);
    });

    it(`should be a no-op on an empty injector`, () => {
      expect(() => stack.inject()).not.toThrow();
    });
  });
});
