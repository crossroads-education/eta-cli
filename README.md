# Project Eta CLI

The CLI for managing and developing with [Eta](https://github.com/crossroads-education/eta).
All commands should be run from the root directory of an Eta instance.

[![Version](https://img.shields.io/npm/v/@xroadsed/eta-cli.svg)](https://npmjs.org/package/@xroadsed/eta-cli)
[![CircleCI](https://circleci.com/gh/crossroads-education/eta-cli/tree/master.svg?style=shield)](https://circleci.com/gh/crossroads-education/eta-cli/tree/master)

<!-- toc -->
* [Project Eta CLI](#project-eta-cli)
<!-- tocstop -->
<!-- tocstop -->
<!-- usage -->
```sh-session
$ npm install -g @xroadsed/eta-cli
$ eta COMMAND
running command...
$ eta (-v|--version|version)
@xroadsed/eta-cli/1.3.0-a5 win32-x64 node-v8.9.1
$ eta --help [COMMAND]
USAGE
  $ eta COMMAND
...
```
<!-- usagestop -->
<!-- usagestop -->
<!-- commands -->
* [eta config:set [KEY] [VALUE]](#eta-configset-key-value)
* [eta foreach [COMMAND]](#eta-foreach-command)
* [eta help [COMMAND]](#eta-help-command)

## eta config:set [KEY] [VALUE]

```
USAGE
  $ eta config:set [KEY] [VALUE]

ARGUMENTS
  KEY    The key to set (including domain)
  VALUE  The value to set
```

_See code: [src/commands/config/set.ts](https://github.com/crossroads-education/eta-cli/blob/v1.3.0-a5/src/commands/config/set.ts)_

## eta foreach [COMMAND]

run a command in each module directory

```
USAGE
  $ eta foreach [COMMAND]

ARGUMENTS
  COMMAND  The command to run in each directory

OPTIONS
  -c, --clientJS=clientJS  run in client-side JS directories only
```

_See code: [src/commands/foreach.ts](https://github.com/crossroads-education/eta-cli/blob/v1.3.0-a5/src/commands/foreach.ts)_

## eta help [COMMAND]

display help for eta

```
USAGE
  $ eta help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v1.2.1/src/commands/help.ts)_
<!-- commandsstop -->
<!-- commandsstop -->
