# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### Hello2 <a name="Hello2" id="cdktf-injector.Hello2"></a>

#### Initializers <a name="Initializers" id="cdktf-injector.Hello2.Initializer"></a>

```typescript
import { Hello2 } from 'cdktf-injector'

new Hello2(parent: Construct, name: string, props: HelloProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdktf-injector.Hello2.Initializer.parameter.parent">parent</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdktf-injector.Hello2.Initializer.parameter.name">name</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdktf-injector.Hello2.Initializer.parameter.props">props</a></code> | <code><a href="#cdktf-injector.HelloProps">HelloProps</a></code> | *No description.* |

---

##### `parent`<sup>Required</sup> <a name="parent" id="cdktf-injector.Hello2.Initializer.parameter.parent"></a>

- *Type:* constructs.Construct

---

##### `name`<sup>Required</sup> <a name="name" id="cdktf-injector.Hello2.Initializer.parameter.name"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdktf-injector.Hello2.Initializer.parameter.props"></a>

- *Type:* <a href="#cdktf-injector.HelloProps">HelloProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdktf-injector.Hello2.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#cdktf-injector.Hello2.sayHello">sayHello</a></code> | *No description.* |

---

##### `toString` <a name="toString" id="cdktf-injector.Hello2.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `sayHello` <a name="sayHello" id="cdktf-injector.Hello2.sayHello"></a>

```typescript
public sayHello(): string
```

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdktf-injector.Hello2.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdktf-injector.Hello2.isConstruct"></a>

```typescript
import { Hello2 } from 'cdktf-injector'

Hello2.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdktf-injector.Hello2.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdktf-injector.Hello2.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="cdktf-injector.Hello2.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


## Structs <a name="Structs" id="Structs"></a>

### HelloProps <a name="HelloProps" id="cdktf-injector.HelloProps"></a>

#### Initializer <a name="Initializer" id="cdktf-injector.HelloProps.Initializer"></a>

```typescript
import { HelloProps } from 'cdktf-injector'

const helloProps: HelloProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdktf-injector.HelloProps.property.name">name</a></code> | <code>string</code> | *No description.* |

---

##### `name`<sup>Required</sup> <a name="name" id="cdktf-injector.HelloProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---



