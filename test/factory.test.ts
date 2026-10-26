import { TerraformStack } from 'cdktf';
import { MockElement, useTestingApp } from './util';
import {
  TerraformInjectorFactory,
  TerraformInjectorStack,
  TerraformInjectorStackAsync,
} from '../src';
import {
  getCaller,
  TerraformInjectorConflictedInjectingMethodTypeError,
} from '../src/module';

describe('TerraformInjectorFactory', () => {
  const app = useTestingApp();

  describe('scopesOn / scopesOnAsync on the same scope', () => {
    it(`should return the same injector for repeated scopesOn`, () => {
      expect(TerraformInjectorFactory.scopesOn(app())).toBe(
        TerraformInjectorFactory.scopesOn(app()),
      );
    });

    it(`should return the same injector for repeated scopesOnAsync`, () => {
      expect(TerraformInjectorFactory.scopesOnAsync(app())).toBe(
        TerraformInjectorFactory.scopesOnAsync(app()),
      );
    });

    it(`should throw ${TerraformInjectorConflictedInjectingMethodTypeError.name} for scopesOnAsync after scopesOn`, () => {
      TerraformInjectorFactory.scopesOn(app());
      expect(() => TerraformInjectorFactory.scopesOnAsync(app())).toThrow(
        TerraformInjectorConflictedInjectingMethodTypeError,
      );
    });

    it(`should throw ${TerraformInjectorConflictedInjectingMethodTypeError.name} for scopesOn after scopesOnAsync`, () => {
      TerraformInjectorFactory.scopesOnAsync(app());
      expect(() => TerraformInjectorFactory.scopesOn(app())).toThrow(
        TerraformInjectorConflictedInjectingMethodTypeError,
      );
    });

    it(`should throw when scopesOnAsync is used on a sync ${TerraformInjectorStack.name}`, () => {
      const stack = new TerraformInjectorStack(app(), 'stack');
      expect(() => TerraformInjectorFactory.scopesOnAsync(stack)).toThrow(
        TerraformInjectorConflictedInjectingMethodTypeError,
      );
    });

    it(`should share the injector between a ${TerraformInjectorStack.name} and scopesOn on it`, () => {
      const stack = new TerraformInjectorStack(app(), 'stack');
      const container = TerraformInjectorFactory.scopesOn(stack).provide(
        MockElement,
        'el',
        () => ({}),
      );
      stack.inject();
      expect(container.element).toBeDefined();
    });
  });

  describe('toString', () => {
    it(`should report the scope path and the registering call site`, () => {
      const stack = new TerraformStack(app(), 'my-stack');
      const parsed = JSON.parse(
        TerraformInjectorFactory.scopesOn(stack).toString(),
      );
      expect(parsed['Scope Path']).toBe('my-stack');
      expect(parsed['Created at']).toContain('factory.test.ts');
    });

    it(`should point a stack injector's call site at the stack constructor call`, () => {
      const sync = new TerraformInjectorStack(app(), 'sync');
      const async = new TerraformInjectorStackAsync(app(), 'async');
      const injectors = [
        TerraformInjectorFactory.scopesOn(sync),
        TerraformInjectorFactory.scopesOnAsync(async),
      ];
      for (const injector of injectors) {
        expect(JSON.parse(injector.toString())['Created at']).toContain(
          'factory.test.ts',
        );
      }
    });

    it(`should describe a container by type, path and call site`, () => {
      const stack = new TerraformInjectorStack(app(), 'stack');
      const parsed = JSON.parse(
        stack.provide(MockElement, 'el', () => ({})).toString(),
      );
      expect(parsed).toEqual({
        'Element Type': 'MockElement',
        'Scope Path': 'stack/el',
        'Created at': expect.stringContaining('factory.test.ts'),
      });
    });
  });

  describe('getCaller', () => {
    it(`should return the first frame outside the library`, () => {
      expect(getCaller()).toContain('factory.test.ts');
    });

    it(`should return <unknown> when the requested frame is past the trace`, () => {
      expect(getCaller(1000)).toBe('<unknown>');
    });
  });
});
