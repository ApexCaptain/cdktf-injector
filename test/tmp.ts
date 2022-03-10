/* eslint-disable spellcheck/spell-checker */
import { vpc } from '@cdktf/provider-aws';
import { App } from 'cdktf';
import { TerraformInjectorFactory, TerraformInjectorStackAsync } from '../src';

let a: any;
let b: any;

class MyStack extends TerraformInjectorStackAsync {
  myVpc1 = this.provide(vpc.Vpc, 'mv', () => ({
    cidrBlock: '10.1.0.0/16',
  })).afterDependenciesInjected((element) => {
    b = this.provide(vpc.Vpc, 'mv4', () => {
      console.log(element);
      return {};
    });
  });
  myVpc2 = this.provide(vpc.Vpc, 'mv2', () => ({
    cidrBlock: '10.2.0.0/16',
    dependsOn: [this.myVpc1.element],
  })).afterInitElement((element) => {
    a = this.provide(vpc.Vpc, 'mv3', () => {
      console.log(element);
      return {};
    });
  });
}

type nonP<T> = Exclude<T, Promise<T>>;

const someFunction = <T>(
  someCallback: () => T extends Promise<unknown> ? never : T,
): T => {
  return someCallback();
};

const x = someFunction(() => 3);
const y = someFunction(async () => 4);

const app = new App();
const myStack = new MyStack(app, 'my-stack');
console.log('start injection');
TerraformInjectorFactory.scopesOnAsync(app)
  .inject()
  .then(() => {
    console.log(myStack.myVpc1.element);
    console.log(a.element);
    console.log(b.element);
  })
  .catch((e) => console.error(e));
