import { TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import {
  TerraformInjectorFactory,
  TerraformInjector,
  TerraformInjectorClass,
  getCaller,
} from '../../module';

export class TerraformInjectorStack
  extends TerraformStack
  implements TerraformInjector
{
  private injector;
  backend;
  provide;
  inject;
  constructor(
    scope: Construct,
    name: string,
    injectorDescription: string = `Injector of <${
      TerraformInjectorStack.name
    }> created at (${getCaller(1)})`,
  ) {
    super(scope, name);
    this.injector = TerraformInjectorFactory.scopesOn(
      this,
      injectorDescription,
    );
    (this.injector as TerraformInjectorClass).caller = getCaller(1);
    this.backend = this.injector.backend.bind(this.injector);
    this.provide = this.injector.provide.bind(this.injector);
    this.inject = this.injector.inject.bind(this.injector);
  }
}
