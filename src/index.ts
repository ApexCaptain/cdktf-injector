import { Construct } from 'constructs';

export interface HelloProps {
  readonly name: string;
}

export class Hello2 extends Construct {
  constructor(parent: Construct, name: string, props: HelloProps) {
    super(parent, name);
    console.log(props);
  }
  public sayHello() {
    return 'hello, world!';
  }
}
