<!-- I.O Sheilds -->

[![npm version][npm-image]][npm-url]
[![Release][release-image]][release-url]
[![License][license-image]][license-url]

# Dependency Injection for CDKTF

`cdktf-injector` is a dependency injection library for [CDKTF][cdktf] ([AWS Cloud Development Kit][cdk] for [Terraform]).

If you are not familiar with [cdktf] and [terraform] yet or haven't heard of them before, this library may not be that so useful. That's totally cool, but I recommend you to have a look what they ([cdktf] and [terraform]) are or at least what's the concept of [IaC]. Those are really amazing.

**There are two prerequisites for cdktf-injector**

- [Terraform][terraform] - You need to install [terraform] on your dev env and it should be accessible on cli path. If you're using `devcontainer` you may paste following commands to your `Dockerfile`.

  ```docker
  ...

  # Pass terraform version as an argument
  ARG TERRAFORM_VERSION=1.1.7

  # Install Terraform
  RUN wget https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip && \
      unzip ./terraform_${TERRAFORM_VERSION}_linux_amd64.zip -d /usr/local/bin/ && \
      rm terraform_${TERRAFORM_VERSION}_linux_amd64.zip

  ...
  ```

- [cdktf] - A library for defining [Terraform] resources using programming constructs. Click [here](https://github.com/hashicorp/terraform-cdk/blob/main/docs/getting-started/typescript.md) to get started. Or, simply type following lines.
  ```sh
  mkdir your-project-name
  cd your-project-name
  npx cdktf-cli init --template="typescript" --local
  ```
  <br>

## Features

- **No decorator**
- **No need to declare custom classes**
- **No need to explicitly write dependencies**

<br>

## Installation

### Using [npm](https://www.npmjs.com/)

```sh
npm install cdktf-injector --save
```

### Using [yarn](https://yarnpkg.com/)

```sh
yarn add cdktf-injector
```

> **Note** : [cdktf] supports multiple languages, such as `TypeScript`, `Python`, `Java`, `C#` and `Go`. Howerver according to [Typescript restriction of jsii](https://aws.github.io/jsii/user-guides/lib-author/typescript-restrictions/), which is I originally wanted to use to power my lib and what [cdktf] depends on, it does not allow using `Parameterized Types(aka: Generics)`. And as far as I know, there is no other decent way to implement dependency injection without using generic or decorator. In brief, `cdktf-injector` is currently availiable only in [Node.js](https://nodejs.org/ko/) env. I'm looking forward to making this lib supports multiple languages soon.

<br>

## Documentation

- ### [Necessity](markdown/necessity.md)
- ### [Examples](markdown/examples.md)
- ### [Cross-Stack References](markdown/cross-stack-references.md)
- ### [Dependency Issues](markdown/dependency-issues.md)
- ### [API](https://apexcaptain.github.io/cdktf-injector/)

<!-- External Links -->

[cdktf]: https://www.terraform.io/cdktf
[cdk]: https://docs.aws.amazon.com/cdk/v2/guide/home.html
[terraform]: https://www.terraform.io/
[iac]: https://en.wikipedia.org/wiki/Infrastructure_as_code
[aws]: https://aws.amazon.com/
[hcl]: https://www.terraform.io/language/syntax/configuration

<!-- I.O Sheilds Links -->

[npm-image]: https://img.shields.io/npm/v/cdktf-injector.svg?color=CB0000&label=npm&style=plastic&logo=npm
[npm-url]: https://www.npmjs.com/package/cdktf-injector
[release-image]: https://github.com/ApexCaptain/cdktf-injector/actions/workflows/release.yml/badge.svg
[release-url]: https://github.com/ApexCaptain/cdktf-injector/actions/workflows/release.yml
[license-image]: https://img.shields.io/github/license/ApexCaptain/cdktf-injector.svg?color=E2AC00&label=License&style=plastic&logo=data%3Aimage%2Fpng%3Bbase64%2CiVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8%2F9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAHSSURBVDiNpZLLa1NREMa%2FmXvzaG2lKDW2EdNqi6Ckxq5Kdy0UsnQTs1CrWxcidFPEnYumG%2FFfUHRloC5cBTU%2Bdi6Cr1QUYh9wqS3RWmqoNzf3zrgIN2DahkK%2B1Zw5v%2Flm5nCANkV%2BoC%2BiR6uQayHXeEBJa9N%2BdWKIHO85AGjQmApPWKVm5j%2BDWr5vxv1m3OOIQioE7hZImQEA3CuQP1zPrTOMM95McPLHfQBg32BuYXQxtxMtzOcTyY5pi7SHh7nfs7nfs%2FWwO9QxbdH8ywvJ3E60kFkY%2FeLXmX6wuNYzVdzoHFcJ3QWQC09YpUom9g4Aum6vft%2BLaUyQSl0dhKKUzWYdgqymL6ZPA0DgXC3uN9iPqa%2FgynU1nccAYDtdDz02rtSfmBor7sdQ9U0k%2Fmkpcicx8PO9z35YOZIYOVWew7b5tlY0PwbG7ZvF5d7Zkdjm52bGJJfHzsfKaVWkZYPhrRg4i22IBB0%2BJvVBXB6Ln%2Fx1WRXYxQQ49IgITwGq6V8CSEHdshZm45bf7SDMnqo%2Bi%2F6uZGKvWzHc6vIgatuAmhPV%2FPFLTDwIALKFlG7RkjGgBQAQleXQ5PqTlgZOvq8C4JB%2F9r42PiuU1Ou8YZnNNW3pH9Tv3ULkpzpnAAAAAElFTkSuQmCC
[license-url]: https://github.com/ApexCaptain/cdktf-injector/blob/main/LICENSE
