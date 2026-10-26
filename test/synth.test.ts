import { LocalBackend, Testing } from 'cdktf';
import { MockElement, useTestingApp } from './util';
import { TerraformInjectorFactory, TerraformInjectorStack } from '../src';

describe('synth', () => {
  const app = useTestingApp();

  it(`should synth a backend and output through Testing.synthScope`, () => {
    const synthesized = Testing.synthScope((scope) => {
      const injector = TerraformInjectorFactory.scopesOn(scope);
      injector.backend(LocalBackend, () => ({ path: 'local.state' }));
      injector
        .provide(MockElement, 'source', () => ({}))
        .addOutput('source-out', () => ({ value: 'from-source' }));
      injector.inject();
    });

    expect(synthesized).toMatchSnapshot();
    expect(synthesized).toContain('local.state');
    expect(synthesized).toContain('from-source');
  });

  it(`should synth a TerraformInjectorStack with its backend and output`, () => {
    const stack = new TerraformInjectorStack(app(), 'stack');
    stack.backend(LocalBackend, () => ({ path: 'stack.state' }));
    stack
      .provide(MockElement, 'el', () => ({}))
      .addOutput('el-out', () => ({ value: 'v' }));
    stack.inject();

    const synthesized = JSON.parse(Testing.synth(stack));
    expect(synthesized.terraform.backend.local.path).toBe('stack.state');
    expect(synthesized.output['el-out'].value).toBe('v');
  });
});
