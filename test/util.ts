import { TerraformElement, TerraformMetaArguments } from 'cdktf';
import 'cdktf/lib/testing/adapters/jest';
import { Construct } from 'constructs';

export interface MockConfig extends TerraformMetaArguments {
  labels?: Record<string, string>;
  items?: string[];
}

export class MockElement extends TerraformElement {
  static readonly tfResourceType: string = 'mock_element';
  constructor(
    scope: Construct,
    id: string,
    public config?: MockConfig,
  ) {
    super(scope, id);
  }
}
