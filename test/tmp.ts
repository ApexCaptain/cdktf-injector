/* eslint-disable spellcheck/spell-checker */
import { vpc } from '@cdktf/provider-aws';
import { App } from 'cdktf';
import { TerraformInjectorFactory, TerraformInjectorStackAsync } from '../src';

class MyStack extends TerraformInjectorStackAsync {
  myVpc1 = this.provide(vpc.Vpc, 'mv', () => ({
    cidrBlock: '10.1.0.0/16',
  }));
  myVpc2 = this.provide(vpc.Vpc, 'mv2', () => ({
    cidrBlock: '10.2.0.0/16',
    dependsOn: [this.myVpc1.element],
  }));
}

const app = new App();
const myStack = new MyStack(app, 'my-stack');
console.log('start injection');
TerraformInjectorFactory.scopesOnAsync(app)
  .inject()
  .then(() => {
    console.log(myStack.myVpc1.element);
  })
  .catch((e) => console.error(e));
