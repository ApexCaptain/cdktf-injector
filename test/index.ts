import { App } from 'cdktf';
import { TerraformInjectorStack } from '../src';
import { MockElement } from './util';
class MyStack extends TerraformInjectorStack {
  ele1 = this.provide(MockElement, 'ele1', () => {
    this.ele2.element;
    return {};
  });
  ele2 = this.provide(MockElement, 'ele2', () => {
    return {};
  })
    .afterInitElement((element) => {
      this.ele3.element;
      this.ele1.element;
      console.log('ai', element);
    })
    .afterDependenciesInjected((element) => {
      console.log('ad', element);
    });

  ele3 = this.provide(MockElement, 'ele3', () => {
    return {};
  });
}

const app = new App();
const myStack = new MyStack(app, 'my-stack');
myStack.inject();
