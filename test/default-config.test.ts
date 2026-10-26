import { LocalBackend, TerraformOutput } from 'cdktf';
import { MockElement, SubMockElement, useTestingApp } from './util';
import { TerraformInjectorFactory, TerraformInjectorStack } from '../src';

class SubOutput extends TerraformOutput {}

describe('setDefaultConfigure', () => {
  const app = useTestingApp();
  let stack: TerraformInjectorStack;
  beforeEach(() => {
    stack = new TerraformInjectorStack(app(), 'stack');
  });

  it(`should receive id, class name and description`, () => {
    const defaultConfigure = jest.fn(() => ({}));
    stack.setDefaultConfigure(defaultConfigure);
    stack.provide(SubMockElement, 'el', () => ({}), true, 'my-desc');
    stack.inject();
    expect(defaultConfigure).toHaveBeenCalledWith(
      'el',
      'SubMockElement',
      'my-desc',
    );
  });

  it(`should merge defaults under the user config, with user keys winning`, () => {
    stack.setDefaultConfigure(() => ({
      labels: { from: 'default', keep: 'default' },
    }));
    const container = stack.provide(MockElement, 'el', () => ({
      labels: { from: 'user' },
    }));
    stack.inject();
    expect(container.element.config?.labels).toEqual({
      from: 'user',
      keep: 'default',
    });
  });

  it(`should deep-merge nested objects`, () => {
    stack.setDefaultConfigure(() => ({
      nested: { a: 'default', b: 'default' },
    }));
    const container = stack.provide(MockElement, 'el', () => ({
      nested: { b: 'user' },
    }));
    stack.inject();
    expect(container.element.config?.nested).toEqual({
      a: 'default',
      b: 'user',
    });
  });

  it(`should replace arrays instead of concatenating`, () => {
    stack.setDefaultConfigure(() => ({ items: ['default-a', 'default-b'] }));
    const container = stack.provide(MockElement, 'el', () => ({
      items: ['user-a'],
    }));
    stack.inject();
    expect(container.element.config?.items).toEqual(['user-a']);
  });

  it(`should keep a default array when the user gives none`, () => {
    stack.setDefaultConfigure(() => ({ items: ['default-a'] }));
    const container = stack.provide(MockElement, 'el', () => ({}));
    stack.inject();
    expect(container.element.config?.items).toEqual(['default-a']);
  });

  it(`should not mutate the user config or the default object`, () => {
    const defaults = { labels: { d: 'default' } };
    const userConfig = { labels: { u: 'user' } };
    stack.setDefaultConfigure(() => defaults);
    stack.provide(MockElement, 'el', () => userConfig);
    stack.inject();
    expect(defaults).toEqual({ labels: { d: 'default' } });
    expect(userConfig).toEqual({ labels: { u: 'user' } });
  });

  it(`should not share merged objects between elements`, () => {
    stack.setDefaultConfigure(() => ({ labels: { d: 'default' } }));
    const a = stack.provide(MockElement, 'a', () => ({
      labels: { only: 'a' },
    }));
    const b = stack.provide(MockElement, 'b', () => ({}));
    stack.inject();
    expect(b.element.config?.labels).toEqual({ d: 'default' });
    expect(a.element.config?.labels).not.toBe(b.element.config?.labels);
  });

  it(`should keep the last setDefaultConfigure`, () => {
    stack
      .setDefaultConfigure(() => ({ labels: { v: 'first' } }))
      .setDefaultConfigure(() => ({ labels: { v: 'second' } }));
    const container = stack.provide(MockElement, 'el', () => ({}));
    stack.inject();
    expect(container.element.config?.labels).toEqual({ v: 'second' });
  });

  describe('skipped elements', () => {
    beforeEach(() => {
      stack.setDefaultConfigure(() => ({
        description: 'from-default',
        labels: { d: 'default' },
      }));
    });

    it(`should skip an element provided with useDefaultConfig false`, () => {
      const container = stack.provide(MockElement, 'el', () => ({}), false);
      stack.inject();
      expect(container.element.config?.labels).toBeUndefined();
    });

    it(`should skip TerraformOutput`, () => {
      const output = stack.provide(TerraformOutput, 'out', () => ({
        value: 'plain',
      }));
      stack.inject();
      expect(output.element.description).toBeUndefined();
    });

    it(`should skip a TerraformOutput subclass`, () => {
      const output = stack.provide(SubOutput, 'out', () => ({
        value: 'plain',
      }));
      stack.inject();
      expect(output.element.description).toBeUndefined();
    });

    it(`should skip outputs created by addOutput`, () => {
      stack
        .provide(MockElement, 'el', () => ({}))
        .addOutput('out', () => ({ value: 'v' }));
      stack.inject();
      const output = stack.node.tryFindChild('out') as TerraformOutput;
      expect(output.description).toBeUndefined();
    });

    it(`should skip the backend`, () => {
      const defaultConfigure = jest.fn(() => ({}));
      stack.setDefaultConfigure(defaultConfigure);
      stack.backend(LocalBackend, () => ({ path: 'x.state' }));
      stack.inject();
      expect(defaultConfigure).not.toHaveBeenCalled();
    });
  });

  describe('scope hierarchy', () => {
    it(`should apply an ancestor default when only the stack is injected`, () => {
      TerraformInjectorFactory.scopesOn(app()).setDefaultConfigure(() => ({
        labels: { who: 'app' },
      }));
      const container = stack.provide(MockElement, 'el', () => ({}));
      stack.inject();
      expect(container.element.config?.labels).toEqual({ who: 'app' });
    });

    it(`should merge app, stack and nested defaults so the closest scope wins`, () => {
      TerraformInjectorFactory.scopesOn(app()).setDefaultConfigure(() => ({
        labels: { who: 'app', app: 'yes' },
      }));
      stack.setDefaultConfigure(() => ({
        labels: { who: 'stack', stack: 'yes' },
      }));
      const nested = new TerraformInjectorStack(stack, 'nested');
      nested.setDefaultConfigure(() => ({ labels: { who: 'nested' } }));
      const container = nested.provide(MockElement, 'el', () => ({
        labels: { user: 'yes' },
      }));

      TerraformInjectorFactory.scopesOn(app()).inject();

      expect(container.element.config?.labels).toEqual({
        who: 'nested',
        app: 'yes',
        stack: 'yes',
        user: 'yes',
      });
    });

    it(`should not apply a nested scope's default to its parent's elements`, () => {
      const nested = new TerraformInjectorStack(stack, 'nested');
      nested.setDefaultConfigure(() => ({ labels: { who: 'nested' } }));
      const container = stack.provide(MockElement, 'el', () => ({}));
      stack.inject();
      expect(container.element.config?.labels).toBeUndefined();
    });

    it(`should not apply a sibling stack's default`, () => {
      new TerraformInjectorStack(app(), 'sibling').setDefaultConfigure(() => ({
        labels: { who: 'sibling' },
      }));
      const container = stack.provide(MockElement, 'el', () => ({}));
      stack.inject();
      expect(container.element.config?.labels).toBeUndefined();
    });
  });
});
