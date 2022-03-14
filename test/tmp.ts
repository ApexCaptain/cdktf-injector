/* eslint-disable spellcheck/spell-checker */
import { vpc } from '@cdktf/provider-aws';
import { App } from 'cdktf';
import { TerraformInjectorStackAsync } from '../src';

class MyStack extends TerraformInjectorStackAsync {
  myVpc1 = this.provide(vpc.Vpc, 'mv', () => ({
    cidrBlock: '10.1.0.0/16',
  }));
}

const app = new App();
const myStack = new MyStack(app, 'my-stack');
const q = myStack.provideLazily(vpc.Vpc, 'something', () => {
  myStack.myVpc1.element;
  return [
    {
      id: 'some',
      configure: () => ({
        cidrBlock: '10.2.0.0/16',
        et: '',
      }),
    },
  ];
});

const ttt = myStack.provide(vpc.Vpc, 'ss2', () => {
  q.element.nested[0].element;
  return {
    cidrBlock: '10.3.0.0/16',
  };
});

const process = async () => {
  try {
    await myStack.inject();

    console.log(q.element.nested.length);
    q.element.nested.forEach((each) => console.log(each.element));
    console.log(ttt.element);
  } catch (error) {
    console.error(error);
  }
};
void process();
