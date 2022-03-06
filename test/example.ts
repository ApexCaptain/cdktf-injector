/* eslint-disable spellcheck/spell-checker */
// import { ec2, vpc } from '@cdktf/provider-aws';
// import { App, TerraformOutput } from 'cdktf';
// import { TerraformInjectorStack } from '../src';
// class MyStack extends TerraformInjectorStack {
//   myVpc = this.provide(vpc.Vpc, 'my-vpc', () => ({
//     cidrBlock: '10.1.0.0/16',
//   }));

//   mySubnet = this.provide(vpc.Subnet, 'my-subnet', () => ({
//     vpcId: this.myVpc.element.id,
//   }));

//   myEc2Instance = this.provide(ec2.Instance, 'my-ec2-instance', () => ({
//     subnetId: this.mySubnet.element.id,
//     ami: 'ami-2757f631',
//     instanceType: 't2.micro',
//   })).addOutput('instance-ip', (instance) => ({
//     value: instance.publicIp,
//   }));

//   /* Or, you can just provide TerraformOutput like other elements
//   instanceIp = this.provide(TerraformOutput, 'instance-ip', () => ({
//     value: this.myEc2Instance.element.publicIp,
//   }));
//   */
// }

// const app = new App();
// const myStack = new MyStack(app, 'my-stack');
// myStack.inject();
// app.synth();

// import { vpc } from '@cdktf/provider-aws';
// import { App, TerraformStack } from 'cdktf';
// class MyStack extends TerraformStack {
//   mySubnet = new vpc.Subnet(this, 'my-subnet', {
//     vpcId: this.myVpc.id,
//     cidrBlock: '10.1.1.0/24',
//   });

//   myVpc = new vpc.Vpc(this, 'my-vpc', {
//     cidrBlock: '10.1.0.0/16',
//   });
// }

// const app = new App();
// new MyStack(app, 'my-stack');
// app.synth();
