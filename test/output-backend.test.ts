import { LocalBackend, TerraformOutput } from 'cdktf';
import { MockElement, useTestingApp } from './util';
import { TerraformInjectorStack } from '../src';
import { TerraformInjectorConflictedElementIdError } from '../src/module';

class SubLocalBackend extends LocalBackend {}

describe('outputs and backend', () => {
  const app = useTestingApp();
  let stack: TerraformInjectorStack;
  beforeEach(() => {
    stack = new TerraformInjectorStack(app(), 'stack');
  });

  describe('addOutput', () => {
    it(`should provide a TerraformOutput built from the element and shared`, () => {
      stack
        .provide(MockElement, 'source', () => [{}, 'shared-value'])
        .addOutput('source-out', (element, shared) => ({
          value: `${element.node.id}:${shared}`,
        }));
      stack.inject();
      const output = stack.node.tryFindChild('source-out') as TerraformOutput;
      expect(output).toBeInstanceOf(TerraformOutput);
      expect(output.value).toBe('source:shared-value');
    });

    it(`should accept an output id callback`, () => {
      stack
        .provide(MockElement, 'source', () => ({}))
        .addOutput(
          (elementId) => `${elementId}-out`,
          () => ({ value: 'v' }),
        );
      stack.inject();
      expect(stack.node.tryFindChild('source-out')).toBeInstanceOf(
        TerraformOutput,
      );
    });

    it(`should add several outputs for one element`, () => {
      stack
        .provide(MockElement, 'source', () => ({}))
        .addOutput('out-1', () => ({ value: 1 }))
        .addOutput('out-2', () => ({ value: 2 }));
      stack.inject();
      expect(stack.node.tryFindChild('out-1')).toBeDefined();
      expect(stack.node.tryFindChild('out-2')).toBeDefined();
    });

    it(`should throw ${TerraformInjectorConflictedElementIdError.name} when the output id is taken`, () => {
      const container = stack.provide(MockElement, 'source', () => ({}));
      stack.provide(MockElement, 'taken', () => ({}));
      expect(() => container.addOutput('taken', () => ({ value: 1 }))).toThrow(
        TerraformInjectorConflictedElementIdError,
      );
    });
  });

  describe('backend', () => {
    it(`should construct the backend with (scope, config)`, () => {
      const backend = stack.backend(LocalBackend, () => ({ path: 'a.state' }));
      stack.inject();
      expect(backend.element).toBeInstanceOf(LocalBackend);
      expect(backend.element.node.scope).toBe(stack);
    });

    it(`should construct a backend subclass with (scope, config)`, () => {
      const backend = stack.backend(SubLocalBackend, () => ({
        path: 'sub.state',
      }));
      stack.inject();
      expect(backend.element).toBeInstanceOf(SubLocalBackend);
    });

    it(`should keep a backend's shared value`, () => {
      const backend = stack.backend(LocalBackend, () => [
        { path: 'a.state' },
        'meta',
      ]);
      stack.inject();
      expect(backend.shared).toBe('meta');
    });

    it(`should let the backend config depend on an element`, () => {
      const source = stack.provide(MockElement, 'source', () => [
        {},
        'p.state',
      ]);
      const backend = stack.backend(LocalBackend, () => ({
        path: source.shared,
      }));
      stack.inject();
      expect(backend.element).toBeInstanceOf(LocalBackend);
    });

    it(`should throw ${TerraformInjectorConflictedElementIdError.name} for a second backend`, () => {
      stack.backend(LocalBackend, () => ({ path: 'first.state' }));
      expect(() =>
        stack.backend(LocalBackend, () => ({ path: 'second.state' })),
      ).toThrow(TerraformInjectorConflictedElementIdError);
    });

    it(`should throw ${TerraformInjectorConflictedElementIdError.name} when provide uses the reserved id`, () => {
      expect(() => stack.provide(MockElement, 'backend', () => ({}))).toThrow(
        TerraformInjectorConflictedElementIdError,
      );
    });

    it(`should allow one backend per stack`, () => {
      const other = new TerraformInjectorStack(app(), 'other');
      stack.backend(LocalBackend, () => ({ path: 'a.state' }));
      expect(() =>
        other.backend(LocalBackend, () => ({ path: 'b.state' })),
      ).not.toThrow();
    });
  });
});
