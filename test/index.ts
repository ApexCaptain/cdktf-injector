import { App } from 'cdktf';
import { TerraformInjectorStack } from '../src';
import { MockElement } from './util';
class MyStack extends TerraformInjectorStack {
  ele1 = this.provide(MockElement, 'ele1', () => {
    this.ele2.element;
    return {};
  });
  ele2 = this.provide(MockElement, 'ele2', () => {
    this.ele3.element;
    return {};
  });
  ele3 = this.provide(MockElement, 'ele3', () => {
    this.ele4.element;
    return {};
  });
  ele4 = this.provide(
    MockElement,
    'ele4',
    () => {
      this.ele5.element;
      return {};
    },
    'someDescription',
  );
  ele5 = this.provide(MockElement, 'ele5', () => {
    this.ele6.element;
    return {};
  });
  ele6 = this.provide(MockElement, 'ele6', () => {
    this.ele3.element;
    return {};
  });
}

const app = new App();
const myStack = new MyStack(app, 'my-stack');
myStack.inject();
