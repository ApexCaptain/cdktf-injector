import { App, TerraformElement, TerraformMetaArguments, Testing } from 'cdktf';
import 'cdktf/lib/testing/adapters/jest';
import { Construct } from 'constructs';
import { injectorMap } from '../src/module';

export interface MockConfig extends TerraformMetaArguments {
  labels?: Record<string, string>;
  items?: string[];
  nested?: { a?: string; b?: string };
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

/** A subclass, to check prototype-chain handling. */
export class SubMockElement extends MockElement {}

/**
 * Fresh `Testing.app()` per test, and a cleared injector registry after each one so state
 * never leaks between tests. Returns a getter because the app is replaced in `beforeEach`.
 */
export const useTestingApp = (): (() => App) => {
  let app: App;
  beforeEach(() => {
    app = Testing.app();
  });
  afterEach(() => {
    injectorMap.clear();
  });
  return () => app;
};
