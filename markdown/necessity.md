# Necessity

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

<img src="https://github.com/ApexCaptain/cdktf-injector/blob/main/assets/hcl-dep.png?raw=true" width="80%">

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

<img src="https://github.com/ApexCaptain/cdktf-injector/blob/main/assets/cdktf-err.png?raw=true" width="80%">

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

<!-- External Links -->

[cdktf]: https://www.terraform.io/cdktf
[cdk]: https://docs.aws.amazon.com/cdk/v2/guide/home.html
[terraform]: https://www.terraform.io/
[iac]: https://en.wikipedia.org/wiki/Infrastructure_as_code
[aws]: https://aws.amazon.com/
[hcl]: https://www.terraform.io/language/syntax/configuration
