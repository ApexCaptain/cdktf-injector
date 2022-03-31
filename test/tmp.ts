/* eslint-disable spellcheck/spell-checker */
import { vpc } from '@cdktf/provider-aws';
import { App } from 'cdktf';
import { TerraformInjectorStackAsync, TerraformInjectorFactory } from '../src';
class MyStack extends TerraformInjectorStackAsync {
  myVpc1 = this.provide(vpc.Vpc, 'mv', () => ({
    cidrBlock: '10.1.0.0/16',
  }));
}

class SomeOtherStack extends TerraformInjectorStackAsync {
  myVpc1 = this.provide(vpc.Vpc, 'mv', () => ({
    cidrBlock: '10.1.0.0/16',
  }));
}

const app = new App();
const ms = new MyStack(app, 'my-stack');
const sos = new SomeOtherStack(app, 'some-other-stack').setDefaultConfigure(
  () => ({
    tags: {
      tmp1: 't-tmp1',
      tmp3: 't-tmp3',
    },
  }),
);
ms.onNewElementInjected((element) => {
  console.log('1', element);
});
ms.onNewElementInjected((element) => {
  console.log('2', element);
});
sos.onNewElementInjected((element) => {
  console.log(element);
});

const main = async () => {
  await TerraformInjectorFactory.scopesOnAsync(app)
    .setDefaultConfigure(() => {
      return {
        tags: {
          tmp1: 'tmp1',
          tmp2: 'tmp2',
        },
      };
    })
    .inject();
};
void main();
