# Cross-stacks References

Sometimes, you may want to separate your infrastructures into multiple stacks. And when the resources have cross-stack dependencis too complexly so that you cannot order which stack comes first, it would be a nightmare.

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

<!-- External Links -->

[cdktf]: https://www.terraform.io/cdktf
[cdk]: https://docs.aws.amazon.com/cdk/v2/guide/home.html
[terraform]: https://www.terraform.io/
[iac]: https://en.wikipedia.org/wiki/Infrastructure_as_code
[aws]: https://aws.amazon.com/
[hcl]: https://www.terraform.io/language/syntax/configuration
