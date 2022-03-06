<!-- I.O Sheilds -->

[![npm version][npm-image]][npm-url]
[![Release][release-image]][release-url]
[![License][license-image]][license-url]

# Dependency Injection for CDKTF

`cdktf-injector` is a dependency injection library for [CDKTF][cdktf] ([AWS Cloud Development Kit][cdk] for [Terraform]).

If you are not familiar with [cdktf] and [terraform] yet or haven't heard of them before, this library may not be that so useful. That's totally cool, but I recommend you to have a look what they ([cdktf] and [terraform]) are or at least what's the concept of [IaC]. Those are really amazing.

**There are two prerequisites for cdktf-injector**

- [Terraform][terraform] - You need to install [terraform] on your dev env and it should be accessible on cli path. If you're using `devcontainer` you may paste following commands to your `Dockerfile`.

  ```docker
  ...

  # Pass terraform version as an argument
  ARG TERRAFORM_VERSION=1.1.7

  # Install Terraform
  RUN wget https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip && \
      unzip ./terraform_${TERRAFORM_VERSION}_linux_amd64.zip -d /usr/local/bin/ && \
      rm terraform_${TERRAFORM_VERSION}_linux_amd64.zip

  ...
  ```

- [cdktf] - A library for defining [Terraform] resources using programming constructs. Click [here](https://github.com/hashicorp/terraform-cdk/blob/main/docs/getting-started/typescript.md) to get started. Or, simply type following lines.
  ```sh
  mkdir your-project-name
  cd your-project-name
  npx cdktf-cli init --template="typescript" --local
  ```
  <br>

## Features

- **No decorator**
- **No need to declare custom classes**
- **No need to explicitly write dependencies**

<br>

## Installation

### Using [npm](https://www.npmjs.com/)

```sh
npm install cdktf-injector --save
```

### Using [yarn](https://yarnpkg.com/)

```sh
yarn add cdktf-injector
```

> **Note** : [cdktf] supports multiple languages, such as `TypeScript`, `Python`, `Java`, `C#` and `Go`. Howerver according to [Typescript restriction of jsii](https://aws.github.io/jsii/user-guides/lib-author/typescript-restrictions/), which is I originally wanted to use to power my lib and what [cdktf] depends on, it does not allow using `Parameterized Types(aka: Generics)`. And as far as I know, there is no other decent way to implement dependency injection without using generic or decorator. In brief, `cdktf-injector` is currently availiable only in [Node.js](https://nodejs.org/ko/) env. I'm looking forward to making this lib supports multiple languages soon.

<br>

## Necessity

I'm gonna show you a brief example of building a simple infrastructure on [AWS] comparing implementation method of using `cdktf with cdktf-injector` with `pure terraform source(hcl)` or just `cdktf only`. This is because [AWS] is probably the most commonly used cloud provider, I believe.

In case you are not a big fan of [AWS], I'll make a list of what elements are used here and what they are like.

- VPC - A virtual network dedicated to your [AWS] account.
  > When you consider your aws account as a **House**, VPC is your **Room**.
- Subnet - A range of IP addresses in your VPC.
  > Then, this is your **Router** at home.
- EC2 Instance - A virtual computing environment.
  > This is your **Computer**.
- Output - Exported data about your resource. In this example, output value is public ip of EC2 instance.
  > And this is an **Public IP address of your computer**.

### Using [terraform] only ([Hashicorp Configuration Language][hcl])

```hcl
resource "aws_vpc" "my-vpc" {
    cidr_block = "10.1.0.0/16"
}

resource "aws_subnet" "my-subnet" {
    vpc_id = aws_vpc.my-vpc.id
    cidr_block = "10.1.1.0/24"
}

resource "aws_instance" "my-ec2-instance" {
    subnet_id = aws_subnet.my-subnet.id
    ami = "ami-2757f631"
    instance_type = "t2.micro"
}

output "instance-ip" {
    value = aws_instance.my-ec2-instance.public_ip
}
```

As you can see, there are 4 [terraform] resources declared up above and their relationships are as follow.

<img src="https://github.com/ApexCaptain/cdktf-injector/blob/main/assets/hcl-dep.png?raw=true" width="50%">

- `instance-ip` depends on `my-ec2-instance`
- `my-ec2-instance` depends on `my-subnet`
- And `my-subnet` depends on `my-vpc`

In general, if you used to normal programming languages, the first thing you can come up with might be...

"Ok, `A` depends on `B`, therefore I should declare `B` over `A`."

In `hcl` however, you don't have to. Declaration order is not important. [Terraform] will take care of it. All you need to do is to make sure that every resource is correctly configured.

This is a **good thing**. Imagine if you have to declare each and every single element in the right order. There could be hundreds or maybe thousands of different stuffs that depend on one another.

Still, `hcl` is a confusing, not very programmable language, and its intellisence is so slow.

[cdktf] could be an alternative. [cdktf] in a nutshell, is a tool used to generate `hcl` code with any one of your familiar programming languages such as `TypeSript`, `Python`, `Java`, `C#` or etc.

Let's take a look example below.

### Using [cdktf] in TypeScript

```typescript
import { ec2, vpc } from '@cdktf/provider-aws';
import { App, TerraformOutput, TerraformStack } from 'cdktf';
import { Construct } from 'constructs';

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const myVpc = new vpc.Vpc(this, 'my-vpc', {
      cidrBlock: '10.1.0.0/16',
    });

    const mySubnet = new vpc.Subnet(this, 'my-subnet', {
      vpcId: myVpc.id,
      cidrBlock: '10.1.1.0/24',
    });

    const myEc2Instance = new ec2.Instance(this, 'my-ec2-instance', {
      subnetId: mySubnet.id,
      ami: 'ami-2757f631',
      instanceType: 't2.micro',
    });

    new TerraformOutput(this, 'instance-ip', {
      value: myEc2Instance.publicIp,
    });
  }
}

const app = new App();
new MyStack(app, 'my-stack');
app.synth();
```

In [cdktf], every resource is a class instance. Thoese are pretty straight forward. Constructing resources using `new` keyword, passing id string and its config, you can build real world infrastructure.

However unlike `hcl`, it is a sequencial language. You cannot create instance refering to another one that is not defined yet.

<img src="https://github.com/ApexCaptain/cdktf-injector/blob/main/assets/cdktf-err.png?raw=true" width="50%">

When you attempt to declare `subnet` before `vpc`, it'll say "Hey, you cannot use `vpc` before it's been initialized!"

And that's where the `cdktf-injector` comes in.

### Using [cdktf] with `cdktf-injector`

```typescript
import { ec2, vpc } from '@cdktf/provider-aws';
import { App, TerraformOutput } from 'cdktf';
import { TerraformInjectorStack } from 'cdktf-injector';
class MyStack extends TerraformInjectorStack {
  myEc2Instance = this.provide(ec2.Instance, 'my-ec2-instance', () => ({
    subnetId: this.mySubnet.element.id,
    ami: 'ami-2757f631',
    instanceType: 't2.micro',
  })).addOutput('instance-ip', (instance) => ({
    value: instance.publicIp,
  }));

  /* Or, you can provide TerraformOutput just as any other resources

  instanceIp = this.provide(TerraformOutput, 'instance-ip', () => ({
    value: this.myEc2Instance.element.publicIp,
  }));
  */

  mySubnet = this.provide(vpc.Subnet, 'my-subnet', () => ({
    vpcId: this.myVpc.element.id,
  }));

  myVpc = this.provide(vpc.Vpc, 'my-vpc', () => ({
    cidrBlock: '10.1.0.0/16',
  }));
}

const app = new App();
const myStack = new MyStack(app, 'my-stack');
myStack.inject(); // At this point, all the elements are instantiated
app.synth();
```

I intentionally cofigured all the resources completely upside down.

Still, it's working. Be aware that you should call `inject` method before sythesize your app.

<br>

## Examples

### Step 1. Load Injector

There are multiple ways to do that.

The most common method is

```typescript
  TerraformInjector.scopesOn(scope : Construct)
```

```typescript
// Use can load injector outside the stack with TerraformInjectorFactory
import { App, TerraformStack } from 'cdktf';
import { TerraformInjectorFactory } from 'cdktf-injector';

const app = new App();
const myStack = new TerraformStack(app, 'my-stack');
const myInjector = TerraformInjectorFactory.scopesOn(myStack); // Load Injector from scope
/*
  Add resources here
  const myBackend = myInjector.backend(SomeBackendClass, configurationCallback)
  const myResource =  myInjector.provide(SomeResourceClass, configurationCallback)
*/
myInjector.inject();
app.synth();
```

```typescript
// Alternatively, declare your own class extending TerraformStack as usual but having injector property
import { App, TerraformStack } from 'cdktf';
import { TerraformInjectorFactory } from 'cdktf-injector';

class MyStack extends TerraformStack {
  injector = TerraformInjectorFactory.scopesOn(this);
  /*
    Add resource here
    myBackend = this.injector.backend(SomeBackendClass, configurationCallback)
    myResource = this.injector.provide(SomeResourceClass, id, configurationCallback)
  */
}

const app = new App();
const myStack = new MyStack(app, 'my-stack');
myStack.injector.inject();
app.synth();
```

```typescript
// Or, you can just use TerraformInjectorStack
import { App } from 'cdktf';
import { TerraformInjectorStack } from 'cdktf-injector';

// It already extends TerraformStack and implemnts TerraformInjector
class MyStack extends TerraformInjectorStack {
  /*
    Add resource here
    myBackend = this.backend(SomeBackendClass, configurationCallback)
    myResource = this.provide(SomeResourceClass, id, configurationCallback)
  */
}

const app = new App();
const myStack = new MyStack(app, 'my-stack');
myStack.inject();
app.synth();
```

### Step 2. Provide Backend

Providing backend is an option. It decides remote backend where your terraform state files are stored. In default, it would be in your local dir.

Sytax is as following

```typescript
  yourInjector.backend(backendClass : ClassExtendsTerraformBackend, configure : () => BackendProps)
```

In my case, I use [AWS] S3 bucket as my remote store. Here is the example.

```typescript
// Use S3Backend as remote backend
import { App, S3Backend } from 'cdktf';
import { TerraformInjectorStack } from 'cdktf-injector';

class MyStack extends TerraformInjectorStack {
  private myBackend = this.backend(S3Backend, () => ({
    bucket: 'your-tf-bucket-name',
    key: 'your/tf-state-file/path',
  }));
}

const app = new App();
const myStack = new MyStack(app, 'my-stack');
myStack.inject();
app.synth();
```

### Step 3. Set Provider

`Provider` in this context, usually means cloud computing service such as [AWS](https://www.npmjs.com/package/@cdktf/provider-aws), [GCP](https://www.npmjs.com/package/@cdktf/provider-google), or maybe [Docker](https://www.npmjs.com/package/@cdktf/provider-docker) and etc.

You should set a provider for each stack. Syntax for provider is the same as any other resources.

```typescript
  yourInjector.provide(terraformElementClass : ClassExtendsTerraformElement, id : string, configure : () => ElementConfig)
```

```typescript
// Set AWS Provider
import { AwsProvider } from '@cdktf/provider-aws';
import { App, S3Backend } from 'cdktf';
import { TerraformInjectorStack } from 'cdktf-injector';
class MyStack extends TerraformInjectorStack {
  private myBackend = this.backend(S3Backend, () => ({
    bucket: 'your-tf-bucket-name',
    key: 'your/tf-state-file/path',
  }));
  private myProvider = this.provide(AwsProvider, 'myProvider', () => ({
    region: 'us-west-1',
    accessKey: 'your-access-key',
    secretKey: 'your-secret-key',
  }));
}

const app = new App();
const myStack = new MyStack(app, 'my-stack');
myStack.inject();
app.synth();
```

### Step 4. Add resources

Let's add some resources.

```typescript
  yourInjector.provide(terraformElementClass : ClassExtendsTerraformElement, id : string, configure : () => ElementConfig)
```

```typescript
import { AwsProvider } from '@cdktf/provider-aws';
import { App, S3Backend } from 'cdktf';
import { TerraformInjectorStack } from 'cdktf-injector';
class MyStack extends TerraformInjectorStack {
  private myBackend = this.backend(S3Backend, () => ({
    bucket: 'your-tf-bucket-name',
    key: 'your/tf-state-file/path',
  }));
  private myProvider = this.provide(AwsProvider, 'myProvider', () => ({
    region: 'us-west-1',
    accessKey: 'your-access-key',
    secretKey: 'your-secret-key',
  }));

  mySubnet = this.provide(vpc.Subnet, 'my-subnet', () => ({
    vpcId: this.myVpc.element.id,
  }));

  myVpc = this.provide(vpc.Vpc, 'my-vpc', () => ({
    cidrBlock: '10.1.0.0/16',
  }));
}

const app = new App();
const myStack = new MyStack(app, 'my-stack');
myStack.inject();
app.synth();
```

### Step 5. Inject all the dependencies

Call `inject` before `synth`

```typescript
...
const app = new App();
const myStack = new MyStack(app, 'my-stack');

myStack.inject();

app.synth();
```

<br>

## Multiple stacks cluster references

Sometimes, you may want to seperate your infrastructures into multiple stacks. And when the resources have cross-stack dependencis too complexly so that you cannot order which stack comes first, it would be a nightmare.

Basically, all injectors scopes on certain `Construct` instance. And when you call `inject` method of it, it'll load every injector below its scope path just like `app.synth`. Therefore, you do not have to manually commit injection for every injector, just call from the very root you want. Take the following example.

```typescript
...
const app = new App()
const myBasicStack = new BasicStack(app, 'my-basic-stack');
const myVpcStack = new VpcStack(myBasicStack, 'my-vpc-stack');
const myEcsStack = new EcsStack(myVpcStack, 'my-ecs-stack')
myBasicStack.inject(); // Also commit injection for myVpcStack and myEcsStack
// Or, TerraformInjectorFactory.scopeOn(app).inject() <-- this will inject every resource below scope 'app'
app.synth();
```

<br>

## Promise Support

There are 2 types of injector.

- `static` injector
- `async` injector.

|                                          | `static`                                       | `async`                                                                       |
| ---------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------- |
| How to load injector                     | TerraformInjectorFactory<br>.`scopesOn`(scope) | TerraformInjectorFactory<br>.`scopesOnAsync`(scope)                           |
| Class Name of predefined stack           | `TerraformInjectorStack`                       | `TerraformInjectorStackAsync`                                                 |
| Return type of<br>configuration callabck | `Config` or `[Config, Shared]`                 | `Config` or `[Config, Shared]`<br>or Promise\<`Config` or `[Config, Shared]`> |
| Injection Method                         | inject() : void                                | inject() : Promise\<void>                                                     |
| Able to embed                            | `static` injector only                         | `static`/`async` injector                                                     |

Here's an example of using `async` injector.

```typescript
import { AwsProvider } from '@cdktf/provider-aws';
import { App, S3Backend } from 'cdktf';
// Import 'async' stack instead of normal 'static' stack
import { TerraformInjectorStackAsync } from 'cdktf-injector';
class MyStack extends TerraformInjectorStackAsync {
  private myBackend = this.backend(S3Backend, () => ({
    bucket: 'your-tf-bucket-name',
    key: 'your/tf-state-file/path',
  }));

  // You can pass both static/async function as configuration callback
  private myProvider = this.provide(AwsProvider, 'myProvider', async () => ({
    region: 'us-west-1',
    accessKey: 'your-access-key',
    secretKey: 'your-secret-key',
  }));

  mySubnet = this.provide(vpc.Subnet, 'my-subnet', () => ({
    vpcId: this.myVpc.element.id,
  }));

  myVpc = this.provide(vpc.Vpc, 'my-vpc', async () => ({
    cidrBlock: '10.1.0.0/16',
  }));
}

const process = async () => {
  const app = new App();
  const myStack = new MyStack(app, 'my-stack');
  // Injection method is now an async function
  await myStack.inject();
  app.synth();
};
process();
```

<br>

## Dependency Problem

You don't have to explicitly write `which` depends on `which`.

`cdktf-injector` will automatically detect dependencies of each resource.

However, that very reason might cause potential problems.

To simplify example, I'll make a class mocking `TerraformElement` as follow.

```typescript
export interface MockConfig extends TerraformMetaArguments {}
export class MockElement extends TerraformElement {
  static readonly tfResourceType: string = 'mock_element';
  constructor(scope: Construct, id: string, public config?: MockConfig) {
    super(scope, id);
  }
}
```

### Case 1. Self-Dependence

```typescript
class MyStack extends TerraformInjectorStack {
  res1 = this.provide(MockElement, 'res1', () => {
    console.log(this.res1.element);
    return {};
  });
}
```

In this case, `res1` depends on `res1`, since it uses `this.res1.element` in its configuration callback.

This is not a possible structure of course. It's `self-dependent`.

I'll throw an error saying...

```
Error: <MockElement res1> is self-dependent. You cannot use its own element when you configure the container.
```

### Case 2. Dependency Cycle

```typescript
class MyStack extends TerraformInjectorStack {
  res1 = this.provide(MockElement, 'res1', () => {
    console.log(this.res2.element);
    return {};
  });

  res2 = this.provide(MockElement, 'res2', () => {
    console.log(this.res3.element);
    return {};
  });

  res3 = this.provide(MockElement, 'res3', () => {
    console.log(this.res4.element);
    return {};
  });

  res4 = this.provide(MockElement, 'res4', () => {
    console.log(this.res5.element);
    return {};
  });

  res5 = this.provide(MockElement, 'res5', () => {
    console.log(this.res3.element);
    return {};
  });
}
```

There are 5 resources.

- `res1` depends on `res2`
- `res2` depends on `res3`
- `res3` depends on `res4`
- `res4` depends on `res5`

Finally, `res5` depends on `res3`. Oops! There is a problem.

Commiting injection later, `cdktf-injector` will require element of `res3` to initialize `res5`.

But, because `res3` depends on `res4` and `res4` depends `res5`, it's another impossible structure.

I'll throw an error saying...

```
Error: There are 3 elements trapped in dependency cycle.
➤ ➤ ➤
▲      ▼
▲      ▼
▲     <MockElement res3>
▲     Element Type : MockElement
▲     Scope path : my-stack/res3
▲     Created at /workspaces/cdktf-injector/test/index.ts:24:15
▲      ▼
▲      ▼
▲      ▼
▲      ▼
▲     <MockElement res4>
▲     Element Type : MockElement
▲     Scope path : my-stack/res4
▲     Created at /workspaces/cdktf-injector/test/index.ts:29:15
▲      ▼
▲      ▼
▲      ▼
▲      ▼
▲     <MockElement res5>
▲     Element Type : MockElement
▲     Scope path : my-stack/res5
▲     Created at /workspaces/cdktf-injector/test/index.ts:34:15
▲      ▼
▲      ▼
◀ ◀ ◀
```

In most case, the last resource of cycle is the cause of error.

> Keep this in mind, existence of such errors is not normal. No matter what provider you're using there should not be any dependency cycles among resources.

<!-- External Links -->

[cdktf]: https://www.terraform.io/cdktf
[cdk]: https://docs.aws.amazon.com/cdk/v2/guide/home.html
[terraform]: https://www.terraform.io/
[iac]: https://en.wikipedia.org/wiki/Infrastructure_as_code
[aws]: https://aws.amazon.com/
[hcl]: https://www.terraform.io/language/syntax/configuration

<!-- I.O Sheilds Links -->

[npm-image]: https://img.shields.io/npm/v/cdktf-injector.svg?color=CB0000&label=npm&style=plastic&logo=npm
[npm-url]: https://www.npmjs.com/package/cdktf-injector
[release-image]: https://github.com/ApexCaptain/cdktf-injector/actions/workflows/release.yml/badge.svg
[release-url]: https://github.com/ApexCaptain/cdktf-injector/actions/workflows/release.yml
[license-image]: https://img.shields.io/github/license/ApexCaptain/cdktf-injector.svg?color=E2AC00&label=License&style=plastic&logo=data%3Aimage%2Fpng%3Bbase64%2CiVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8%2F9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAHSSURBVDiNpZLLa1NREMa%2FmXvzaG2lKDW2EdNqi6Ckxq5Kdy0UsnQTs1CrWxcidFPEnYumG%2FFfUHRloC5cBTU%2Bdi6Cr1QUYh9wqS3RWmqoNzf3zrgIN2DahkK%2B1Zw5v%2Flm5nCANkV%2BoC%2BiR6uQayHXeEBJa9N%2BdWKIHO85AGjQmApPWKVm5j%2BDWr5vxv1m3OOIQioE7hZImQEA3CuQP1zPrTOMM95McPLHfQBg32BuYXQxtxMtzOcTyY5pi7SHh7nfs7nfs%2FWwO9QxbdH8ywvJ3E60kFkY%2FeLXmX6wuNYzVdzoHFcJ3QWQC09YpUom9g4Aum6vft%2BLaUyQSl0dhKKUzWYdgqymL6ZPA0DgXC3uN9iPqa%2FgynU1nccAYDtdDz02rtSfmBor7sdQ9U0k%2Fmkpcicx8PO9z35YOZIYOVWew7b5tlY0PwbG7ZvF5d7Zkdjm52bGJJfHzsfKaVWkZYPhrRg4i22IBB0%2BJvVBXB6Ln%2Fx1WRXYxQQ49IgITwGq6V8CSEHdshZm45bf7SDMnqo%2Bi%2F6uZGKvWzHc6vIgatuAmhPV%2FPFLTDwIALKFlG7RkjGgBQAQleXQ5PqTlgZOvq8C4JB%2F9r42PiuU1Ou8YZnNNW3pH9Tv3ULkpzpnAAAAAElFTkSuQmCC
[license-url]: https://github.com/ApexCaptain/cdktf-injector/blob/main/LICENSE
