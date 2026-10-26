import { Testing, TerraformStack } from 'cdktf';
import { MockElement, useTestingApp } from './util';
import { TerraformInjectorFactory, TerraformInjectorStack } from '../src';
import {
  injectorMap,
  TerraformInjectorInvalidScopePathError,
} from '../src/module';

describe('injector registry', () => {
  const app = useTestingApp();

  describe('scope isolation between Apps in one process', () => {
    it(`should not inject a same-named stack of another App`, () => {
      const otherApp = Testing.app();
      const mine = TerraformInjectorFactory.scopesOn(
        new TerraformStack(app(), 'S'),
      );
      const theirs = TerraformInjectorFactory.scopesOn(
        new TerraformStack(otherApp, 'S'),
      );
      const theirContainer = theirs.provide(MockElement, 'x', () => ({}));

      mine.inject();

      expect(() => theirContainer.element).toThrow();
    });

    it(`should not inject another App's elements when injecting from an App root`, () => {
      const otherApp = Testing.app();
      const rootInjector = TerraformInjectorFactory.scopesOn(app());
      const theirContainer = TerraformInjectorFactory.scopesOn(
        otherApp,
      ).provide(MockElement, 'x', () => ({}));

      rootInjector.inject();

      expect(() => theirContainer.element).toThrow();
    });

    it(`should reject a dependency on a same-path element of another App`, () => {
      const otherApp = Testing.app();
      const theirs = TerraformInjectorFactory.scopesOn(
        new TerraformStack(otherApp, 'S'),
      );
      const theirContainer = theirs.provide(MockElement, 'x', () => ({}));
      const mine = TerraformInjectorFactory.scopesOn(
        new TerraformStack(app(), 'S'),
      );
      mine.provide(MockElement, 'y', () => {
        theirContainer.element;
        return {};
      });

      expect(() => mine.inject()).toThrow(
        TerraformInjectorInvalidScopePathError,
      );
    });
  });

  describe('scope isolation inside one App', () => {
    it(`should inject only the target stack, not its siblings`, () => {
      const a = new TerraformInjectorStack(app(), 'a');
      const b = new TerraformInjectorStack(app(), 'b');
      const aContainer = a.provide(MockElement, 'x', () => ({}));
      const bContainer = b.provide(MockElement, 'x', () => ({}));

      a.inject();

      expect(aContainer.element).toBeInstanceOf(MockElement);
      expect(() => bContainer.element).toThrow();
    });

    it(`should not treat a sibling whose id shares a prefix as nested`, () => {
      const a = new TerraformInjectorStack(app(), 'stack');
      const b = new TerraformInjectorStack(app(), 'stack-2');
      const bContainer = b.provide(MockElement, 'x', () => ({}));

      a.inject();

      expect(() => bContainer.element).toThrow();
    });

    it(`should inject every stack when injecting from the App root`, () => {
      const rootInjector = TerraformInjectorFactory.scopesOn(app());
      const aContainer = new TerraformInjectorStack(app(), 'a').provide(
        MockElement,
        'x',
        () => ({}),
      );
      const bContainer = new TerraformInjectorStack(app(), 'b').provide(
        MockElement,
        'x',
        () => ({}),
      );

      rootInjector.inject();

      expect(aContainer.element).toBeInstanceOf(MockElement);
      expect(bContainer.element).toBeInstanceOf(MockElement);
    });
  });

  it(`should register one injector per scope`, () => {
    const stack = new TerraformStack(app(), 's');
    TerraformInjectorFactory.scopesOn(stack);
    TerraformInjectorFactory.scopesOn(stack);
    expect(injectorMap.size).toBe(1);
  });
});
