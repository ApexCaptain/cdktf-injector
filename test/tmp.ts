/* eslint-disable spellcheck/spell-checker */
import { vpc } from '@cdktf/provider-aws';
import { App } from 'cdktf';
import { TerraformInjectorFactory, TerraformInjectorStackAsync } from '../src';

class MyStack extends TerraformInjectorStackAsync {
  myVpc1 = this.provide(vpc.Vpc, 'mv', () => ({
    cidrBlock: '10.1.0.0/16',
  }));
}

const app = new App();
const myStack = new MyStack(app, 'my-stack');

class MyStack2 extends TerraformInjectorStackAsync {
  myVpc2 = this.provide(vpc.Vpc, 'mv', () => {
    myStack.myVpc1.element;
    return {
      cidrBlock: '10.1.0.0/16',
    };
  });
}
const myStack2 = new MyStack2(app, 'my-stack2');

TerraformInjectorFactory.scopesOnAsync(myStack2)
  .inject()
  .then(() => {
    console.log(myStack.myVpc1.element);
    console.log(myStack2.myVpc2.element);
  })
  .catch((e) => console.error(e));
