@xroadsed/eta-cli
=================

CLI for Eta MVC server

[![Version](https://img.shields.io/npm/v/@xroadsed/eta-cli.svg)](https://npmjs.org/package/@xroadsed/eta-cli)
[![CircleCI](https://circleci.com/gh/crossroads-education/eta-cli/tree/master.svg?style=shield)](https://circleci.com/gh/crossroads-education/eta-cli/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/crossroads-education/eta-cli?branch=master&svg=true)](https://ci.appveyor.com/project/crossroads-education/eta-cli/branch/master)
[![Codecov](https://codecov.io/gh/crossroads-education/eta-cli/branch/master/graph/badge.svg)](https://codecov.io/gh/crossroads-education/eta-cli)
[![Greenkeeper](https://badges.greenkeeper.io/crossroads-education/eta-cli.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/crossroads-education/eta-cli/badge.svg)](https://snyk.io/test/github/crossroads-education/eta-cli)
[![Downloads/week](https://img.shields.io/npm/dw/@xroadsed/eta-cli.svg)](https://npmjs.org/package/@xroadsed/eta-cli)
[![License](https://img.shields.io/npm/l/@xroadsed/eta-cli.svg)](https://github.com/crossroads-education/eta-cli/blob/master/package.json)

<!-- toc -->
* [Install](#install)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
<!-- install -->
# Install

with yarn:
```
$ yarn global add @xroadsed/eta-cli
```

or with npm:
```
$ npm install -g @xroadsed/eta-cli
```
<!-- installstop -->
<!-- usage -->
# Usage

```sh-session
$ eta COMMAND
running command...
$ eta (-v|--version|version)
@xroadsed/eta-cli/1.3.0-a1 (win32-x64) node-v8.9.4
$ eta --help [COMMAND]
USAGE
  $ eta COMMAND
...
```
<!-- usagestop -->
<!-- commands -->
# Commands

* [eta hello [FILE]](#hello-file)
* [eta help [COMMAND]](#help-command)
## hello [FILE]

describe the command here

```
USAGE
  $ eta hello [FILE]

OPTIONS
  -f, --force
  -n, --name=name  name to print

EXAMPLES
  $ eta hello
  hello world from ./src/hello.ts!

  $ eta hello --name myname
  hello myname from .src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/crossroads-education/eta-cli/blob/v1.3.0-a1/src/commands/hello.ts)_

## help [COMMAND]

display help for eta

```
USAGE
  $ eta help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v1.1.6/src/commands/help.ts)_
<!-- commandsstop -->
