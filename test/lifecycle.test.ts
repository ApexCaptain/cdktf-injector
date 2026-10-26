import { MockElement, useTestingApp } from './util';
import { TerraformInjectorStack } from '../src';
import { TerraformInjectorConflictedInjectingMethodTypeError } from '../src/module';

describe('element lifecycle hooks', () => {
  const app = useTestingApp();
  let stack: TerraformInjectorStack;
  beforeEach(() => {
    stack = new TerraformInjectorStack(app(), 'stack');
  });

  it(`should run afterInitElement, onNewElementInjected, then afterDependenciesInjected once each`, () => {
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

  it(`should run multiple callbacks of one kind in registration order`, () => {
    const order: string[] = [];
    stack
      .provide(MockElement, 'el', () => ({}))
      .afterInitElement(() => order.push('init-1'))
      .afterInitElement(() => order.push('init-2'))
      .afterDependenciesInjected(() => order.push('deps-1'))
      .afterDependenciesInjected(() => order.push('deps-2'));
    stack.inject();
    expect(order).toEqual(['init-1', 'init-2', 'deps-1', 'deps-2']);
  });

  it(`should pass the element and shared value to callbacks`, () => {
    const received: unknown[] = [];
    const container = stack
      .provide(MockElement, 'el', () => [{}, 'shared'])
      .afterInitElement((element, shared) => received.push(element, shared))
      .afterDependenciesInjected((element, shared) =>
        received.push(element, shared),
      );
    stack.inject();
    expect(received).toEqual([
      container.element,
      'shared',
      container.element,
      'shared',
    ]);
  });

  it(`should let afterInitElement read an element that is created later`, () => {
    let seen: string | undefined;
    const notified: string[] = [];
    stack.onNewElementInjected((element) => notified.push(element.node.id));
    const holder: Record<string, any> = {};
    holder.first = stack
      .provide(MockElement, 'first', () => ({}))
      .afterInitElement(() => {
        seen = holder.second.element.node.id;
      });
    holder.second = stack.provide(MockElement, 'second', () => ({}));
    stack.inject();
    expect(seen).toBe('second');
    expect(notified.sort()).toEqual(['first', 'second']);
  });

  it(`should let afterDependenciesInjected read any element of the pass`, () => {
    let seen: string | undefined;
    const holder: Record<string, any> = {};
    holder.first = stack
      .provide(MockElement, 'first', () => ({}))
      .afterDependenciesInjected(() => {
        seen = holder.last.element.node.id;
      });
    holder.last = stack.provide(MockElement, 'last', () => ({}));
    stack.inject();
    expect(seen).toBe('last');
  });

  it(`should inject an element provided from afterDependenciesInjected in the same inject call`, () => {
    let late: any;
    stack
      .provide(MockElement, 'el', () => ({}))
      .afterDependenciesInjected(() => {
        late = stack.provide(MockElement, 'late', () => ({}));
      });
    stack.inject();
    expect(late.element).toBeInstanceOf(MockElement);
  });

  it(`should run afterDependenciesInjected registered after inject on the next inject`, () => {
    const container = stack.provide(MockElement, 'el', () => ({}));
    stack.inject();
    const callback = jest.fn();
    container.afterDependenciesInjected(callback);
    stack.inject();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  describe('callbacks registered after the element exists', () => {
    it(`should run a late afterInitElement on the next inject, once`, () => {
      const container = stack.provide(MockElement, 'el', () => ({}));
      stack.inject();
      const callback = jest.fn();
      container.afterInitElement(callback);
      stack.inject();
      stack.inject();
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(container.element, undefined);
    });

    it(`should not notify onNewElementInjected again for a late afterInitElement`, () => {
      const notified = jest.fn();
      stack.onNewElementInjected(notified);
      const container = stack.provide(MockElement, 'el', () => ({}));
      stack.inject();
      container.afterInitElement(() => undefined);
      stack.inject();
      expect(notified).toHaveBeenCalledTimes(1);
    });

    it(`should run an afterInitElement added from afterDependenciesInjected in the same inject call`, () => {
      const late = jest.fn();
      const first = stack.provide(MockElement, 'first', () => ({}));
      stack
        .provide(MockElement, 'second', () => ({}))
        .afterDependenciesInjected(() => {
          first.afterInitElement(late);
        });
      stack.inject();
      expect(late).toHaveBeenCalledTimes(1);
    });
  });

  it(`should propagate an error thrown by afterInitElement`, () => {
    stack
      .provide(MockElement, 'el', () => ({}))
      .afterInitElement(() => {
        throw new RangeError('after-init');
      });
    expect(() => stack.inject()).toThrow('after-init');
  });

  describe('onNewElementInjected', () => {
    it(`should call every registered callback`, () => {
      const a = jest.fn();
      const b = jest.fn();
      stack.onNewElementInjected(a).onNewElementInjected(b);
      stack.provide(MockElement, 'el', () => ({}));
      stack.inject();
      expect(a).toHaveBeenCalledTimes(1);
      expect(b).toHaveBeenCalledTimes(1);
    });

    it(`should only fire for elements of its own injector`, () => {
      const nested = new TerraformInjectorStack(stack, 'nested');
      const rootSeen: string[] = [];
      const nestedSeen: string[] = [];
      stack.onNewElementInjected((element) => rootSeen.push(element.node.id));
      nested.onNewElementInjected((element) =>
        nestedSeen.push(element.node.id),
      );
      stack.provide(MockElement, 'root-el', () => ({}));
      nested.provide(MockElement, 'nested-el', () => ({}));
      stack.inject();
      expect(rootSeen).toEqual(['root-el']);
      expect(nestedSeen).toEqual(['nested-el']);
    });

    it(`should fire for lazily provided nested elements`, () => {
      const seen: string[] = [];
      stack.onNewElementInjected((element) => seen.push(element.node.id));
      stack.provideLazily(MockElement, 'lazy', () => [
        { id: 'a', configure: () => ({}) },
      ]);
      stack.inject();
      expect(seen).toEqual(['lazy', 'a']);
    });
  });

  describe('async results on a sync injector', () => {
    let unhandled: jest.Mock;
    beforeEach(() => {
      unhandled = jest.fn();
      process.on('unhandledRejection', unhandled);
    });
    afterEach(() => {
      process.off('unhandledRejection', unhandled);
    });
    const settle = () => new Promise((resolve) => setTimeout(resolve, 5));

    it(`should throw ${TerraformInjectorConflictedInjectingMethodTypeError.name} when configure returns a Promise`, () => {
      stack.provide(MockElement, 'el', (async () => ({})) as any);
      expect(() => stack.inject()).toThrow(
        TerraformInjectorConflictedInjectingMethodTypeError,
      );
    });

    it(`should throw when afterInitElement returns a Promise, without an unhandled rejection`, async () => {
      stack
        .provide(MockElement, 'el', () => ({}))
        .afterInitElement(async () => {
          throw new RangeError('late failure');
        });
      expect(() => stack.inject()).toThrow(/afterInitElement.*Promise/);
      await settle();
      expect(unhandled).not.toHaveBeenCalled();
    });

    it(`should throw when afterDependenciesInjected returns a Promise`, () => {
      stack
        .provide(MockElement, 'el', () => ({}))
        .afterDependenciesInjected(async () => undefined);
      expect(() => stack.inject()).toThrow(
        TerraformInjectorConflictedInjectingMethodTypeError,
      );
    });

    it(`should throw when onNewElementInjected returns a Promise`, () => {
      stack.onNewElementInjected((async () => undefined) as any);
      stack.provide(MockElement, 'el', () => ({}));
      expect(() => stack.inject()).toThrow(
        TerraformInjectorConflictedInjectingMethodTypeError,
      );
    });

    it(`should throw when an addOutput config returns a Promise`, () => {
      stack
        .provide(MockElement, 'el', () => ({}))
        .addOutput('out', (async () => ({ value: 1 })) as any);
      expect(() => stack.inject()).toThrow(
        TerraformInjectorConflictedInjectingMethodTypeError,
      );
    });
  });
});
