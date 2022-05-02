# Examples

### Step 1. Load Injector

There are multiple ways to do that.

The most common method is

```typescript
  TerraformInjectorFactory.scopesOn(scope : Construct)
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

<!-- External Links -->

[cdktf]: https://www.terraform.io/cdktf
[cdk]: https://docs.aws.amazon.com/cdk/v2/guide/home.html
[terraform]: https://www.terraform.io/
[iac]: https://en.wikipedia.org/wiki/Infrastructure_as_code
[aws]: https://aws.amazon.com/
[hcl]: https://www.terraform.io/language/syntax/configuration
