/* eslint-disable spellcheck/spell-checker */
// import { vpc } from '@cdktf/provider-aws';
// import { App } from 'cdktf';
// import { TerraformInjectorStack } from '../src';

// class MyStack extends TerraformInjectorStack {
//   myVpc1 = this.provide(vpc.Vpc, 'mv', () => ({
//     cidrBlock: '10.1.0.0/16',
//   }));
//   myVpc2 = this.provide(vpc.Vpc, 'mv2', () => ({
//     cidrBlock: '10.2.0.0/16',
//     dependsOn: [this.myVpc1.element],
//   }));
// }

// const app = new App();
// const myStack = new MyStack(app, 'my-stack');
// console.log('start injection');
// myStack.inject();
