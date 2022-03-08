# Dependency Issues

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

It'll throw an error saying...

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

It'll throw an error saying...

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
