# Advanced Usage

Features beyond `backend`, `provide` and `inject`. Every example uses `TerraformInjectorStack`, but the same methods exist on any injector from `TerraformInjectorFactory.scopesOn` / `scopesOnAsync`.

### Shared Object

A configure callback can return `[config, shared]` instead of `config`. `shared` is any value you want to keep next to the element. Read it through the container's `shared` getter, just like `element`.

```typescript
class MyStack extends TerraformInjectorStack {
  myVpc = this.provide(Vpc, 'my-vpc', () => {
    const cidrBlock = '10.1.0.0/16';
    return [{ cidrBlock }, { cidrBlock }];
  });

  mySubnet = this.provide(Subnet, 'my-subnet', () => ({
    vpcId: this.myVpc.element.id,
    cidrBlock: this.myVpc.shared.cidrBlock.replace('0.0/16', '1.0/24'),
  }));
}
```

Reading `shared` declares a dependency the same way reading `element` does.

### Element Outputs

`addOutput` adds a `TerraformOutput` for an element. The id can be a string or a function of the element id.

```typescript
myInstance = this.provide(Instance, 'my-instance', () => ({
  ami: 'ami-2757f631',
  instanceType: 't2.micro',
})).addOutput(
  (id) => `${id}-public-ip`,
  (instance) => ({ value: instance.publicIp }),
);
```

### Lifecycle Callbacks

| Method                                    | Runs                                                    |
| ----------------------------------------- | ------------------------------------------------------- |
| `container.afterInitElement(cb)`          | Right after that element is created                     |
| `injector.onNewElementInjected(cb)`       | After each element of the injector is created           |
| `container.afterDependenciesInjected(cb)` | After every element under the injected scope is created |

For two elements where `second` depends on `first`, the order is:

```
first.afterInitElement → onNewElementInjected(first)
→ second.afterInitElement → onNewElementInjected(second)
→ first.afterDependenciesInjected → second.afterDependenciesInjected
```

Each callback runs once, even if `inject` is called again. Multiple callbacks on one container run in registration order. A callback registered after its element was created runs on the next `inject` call.

On an `async` injector, configure and callbacks may return a `Promise` and are awaited. A synchronous injector cannot await, so a `Promise` from configure or any callback throws `TerraformInjectorConflictedInjectingMethodTypeError`. Make the callback synchronous, or use `scopesOnAsync` / `TerraformInjectorStackAsync`.

### Default Configuration

`setDefaultConfigure` sets config that is deep-merged into every element provided at or below the injector's scope.

```typescript
const app = new App();
TerraformInjectorFactory.scopesOn(app).setDefaultConfigure(() => ({
  tags: { project: 'my-project' },
}));

class MyStack extends TerraformInjectorStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.setDefaultConfigure((id, className) => ({
      tags: { stack: 'my-stack', resource: `${className}/${id}` },
    }));
  }

  myVpc = this.provide(Vpc, 'my-vpc', () => ({
    cidrBlock: '10.1.0.0/16',
    tags: { Name: 'main' },
  }));
}
```

- Merge order: outermost scope first, then inner scopes, then the element's own config. The more specific value wins.
- Arrays are replaced, not concatenated.
- Backends and `TerraformOutput` never receive defaults.
- Pass `useDefaultConfig = false` to `provide` / `provideLazily` to skip defaults for one element.
- Every other element receives defaults, providers included. Return only keys that every element in the scope accepts, or branch on `className`.

### Lazy Provision

`provideLazily` creates a variable number of elements whose list depends on other elements. The callback returns one entry per element. Each entry is provided as a sibling in the same injector under its own `id`, so the ids must not collide with other elements.

```typescript
class MyStack extends TerraformInjectorStack {
  myVpc = this.provide(Vpc, 'my-vpc', () => ({
    cidrBlock: '10.1.0.0/16',
  }));

  mySubnets = this.provideLazily(Subnet, 'my-subnets', () =>
    ['a', 'b', 'c'].map((zone, index) => ({
      id: `my-subnet-${zone}`,
      configure: () => ({
        vpcId: this.myVpc.element.id,
        availabilityZone: `us-west-2${zone}`,
        cidrBlock: `10.1.${index}.0/24`,
      }),
    })),
  );
}

// After inject()
myStack.mySubnets.element.nested.map((subnet) => subnet.element.id);
```

The callback can also return `[entries, shared]`. On an `async` injector, each entry's `configure` may be async.

<!-- External Links -->

[cdktf]: https://www.terraform.io/cdktf
[terraform]: https://www.terraform.io/
