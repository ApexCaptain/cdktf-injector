import { TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import {
  TerraformInjectorFactory,
  TerraformInjectorAsync,
  getCaller,
  TerraformInjectorClass,
} from '../../module';

export class TerraformInjectorStackAsync
  extends TerraformStack
  implements TerraformInjectorAsync
{
  private injector;
  backend;
  provide;
  inject;
  constructor(
    scope: Construct,
    name: string,
    injectorDescription: string = `Async-Injector of <${
      TerraformInjectorStackAsync.name
    }> created at (${getCaller(1)})`,
  ) {
    super(scope, name);
    this.injector = TerraformInjectorFactory.scopesOnAsync(
      this,
      injectorDescription,
    );
    (this.injector as TerraformInjectorClass).caller = getCaller(1);
    this.backend = this.injector.backend.bind(this.injector);
    this.provide = this.injector.provide.bind(this.injector);
    this.inject = this.injector.inject.bind(this.injector);
  }
}
