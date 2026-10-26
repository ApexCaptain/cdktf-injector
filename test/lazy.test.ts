import { MockElement, useTestingApp } from './util';
import { TerraformInjectorStack, TerraformInjectorStackAsync } from '../src';
import {
  TerraformInjectorConflictedElementIdError,
  TerraformLazyElement,
  TerraformLazyElementAsync,
} from '../src/module';

describe('provideLazily', () => {
  const app = useTestingApp();
  let stack: TerraformInjectorStack;
  beforeEach(() => {
    stack = new TerraformInjectorStack(app(), 'stack');
  });

  it(`should create nested elements in order on a sync injector`, () => {
    const lazy = stack.provideLazily(MockElement, 'lazy', () => [
      { id: 'a', configure: () => ({ labels: { name: 'a' } }) },
      { id: 'b', configure: () => ({ labels: { name: 'b' } }) },
    ]);
    stack.inject();
    expect(lazy.element).toBeInstanceOf(TerraformLazyElement);
    expect(
      lazy.element.nested.map((each) => each.element.config?.labels?.name),
    ).toEqual(['a', 'b']);
  });

  it(`should create nested elements as siblings in the injector's scope`, () => {
    const lazy = stack.provideLazily(MockElement, 'lazy', () => [
      { id: 'a', configure: () => ({}) },
    ]);
    stack.inject();
    expect(lazy.element.nested[0].element.node.scope).toBe(stack);
    expect(stack.node.tryFindChild('a')).toBe(lazy.element.nested[0].element);
  });

  it(`should create nested elements on an async injector`, async () => {
    const asyncStack = new TerraformInjectorStackAsync(app(), 'async');
    const lazy = asyncStack.provideLazily(MockElement, 'lazy', () => [
      { id: 'a', configure: async () => ({}) },
      { id: 'b', configure: () => ({}) },
    ]);
    await asyncStack.inject();
    expect(lazy.element).toBeInstanceOf(TerraformLazyElementAsync);
    expect(lazy.element.nested).toHaveLength(2);
  });

  it(`should split a [configs, shared] tuple`, () => {
    const lazy = stack.provideLazily(MockElement, 'lazy', () => [
      [{ id: 'a', configure: () => ({}) }],
      'lazy-shared',
    ]);
    stack.inject();
    expect(lazy.shared).toBe('lazy-shared');
    expect(lazy.element.nested).toHaveLength(1);
  });

  it(`should keep each nested element's own shared value`, () => {
    const lazy = stack.provideLazily(MockElement, 'lazy', () => [
      { id: 'a', configure: () => [{}, 'a-shared'] },
    ]);
    stack.inject();
    expect(lazy.element.nested[0].shared).toBe('a-shared');
  });

  it(`should accept an empty list`, () => {
    const lazy = stack.provideLazily(MockElement, 'lazy', () => []);
    stack.inject();
    expect(lazy.element.nested).toEqual([]);
  });

  it(`should let a nested element depend on another element`, () => {
    const base = stack.provide(MockElement, 'base', () => ({}));
    const lazy = stack.provideLazily(MockElement, 'lazy', () => [
      {
        id: 'a',
        configure: () => ({ labels: { base: base.element.node.id } }),
      },
    ]);
    stack.inject();
    expect(lazy.element.nested[0].element.config?.labels?.base).toBe('base');
  });

  it(`should let the lazy configure depend on another element`, () => {
    const base = stack.provide(MockElement, 'base', () => [{}, ['x', 'y']]);
    const lazy = stack.provideLazily(MockElement, 'lazy', () =>
      (base.shared as string[]).map((id) => ({ id, configure: () => ({}) })),
    );
    stack.inject();
    expect(lazy.element.nested.map((each) => each.element.node.id)).toEqual([
      'x',
      'y',
    ]);
  });

  describe('default config', () => {
    beforeEach(() => {
      stack.setDefaultConfigure((_id, _className, description) => ({
        labels: { d: description ?? 'none' },
      }));
    });

    it(`should apply defaults to nested elements and pass their description`, () => {
      const lazy = stack.provideLazily(MockElement, 'lazy', () => [
        { id: 'a', configure: () => ({}), description: 'nested-desc' },
      ]);
      stack.inject();
      expect(lazy.element.nested[0].element.config?.labels).toEqual({
        d: 'nested-desc',
      });
    });

    it(`should skip defaults for a nested element with useDefaultConfig false`, () => {
      const lazy = stack.provideLazily(MockElement, 'lazy', () => [
        { id: 'a', configure: () => ({}), useDefaultConfig: false },
        { id: 'b', configure: () => ({}) },
      ]);
      stack.inject();
      expect(lazy.element.nested[0].element.config?.labels).toBeUndefined();
      expect(lazy.element.nested[1].element.config?.labels).toEqual({
        d: 'none',
      });
    });
  });

  describe('id conflicts', () => {
    it(`should throw ${TerraformInjectorConflictedElementIdError.name} when the lazy id is taken`, () => {
      stack.provide(MockElement, 'taken', () => ({}));
      expect(() => stack.provideLazily(MockElement, 'taken', () => [])).toThrow(
        TerraformInjectorConflictedElementIdError,
      );
    });

    it(`should throw ${TerraformInjectorConflictedElementIdError.name} for the reserved backend id`, () => {
      expect(() =>
        stack.provideLazily(MockElement, 'backend', () => []),
      ).toThrow(TerraformInjectorConflictedElementIdError);
    });

    it(`should throw ${TerraformInjectorConflictedElementIdError.name} on inject when a nested id is taken`, () => {
      stack.provide(MockElement, 'a', () => ({}));
      stack.provideLazily(MockElement, 'lazy', () => [
        { id: 'a', configure: () => ({}) },
      ]);
      expect(() => stack.inject()).toThrow(
        TerraformInjectorConflictedElementIdError,
      );
    });
  });
});
