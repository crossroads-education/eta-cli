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
@xroadsed/eta-cli/1.3.0-a6 win32-x64 node-v8.9.1
$ eta --help [COMMAND]
USAGE
  $ eta COMMAND
...
```
<!-- usagestop -->
<!-- usagestop -->
<!-- commands -->
* [eta compile:client](#eta-compileclient)
* [eta compile:server](#eta-compileserver)
* [eta config:get [KEY]](#eta-configget-key)
* [eta config:set [KEY] [VALUE]](#eta-configset-key-value)
* [eta db:reset](#eta-dbreset)
* [eta db:seed](#eta-dbseed)
* [eta foreach [COMMAND]](#eta-foreach-command)
* [eta help [COMMAND]](#eta-help-command)

## eta compile:client

compile client-side Typescript

```
USAGE
  $ eta compile:client

OPTIONS
  -m, --modules=modules  modules to compile client-side JS for (comma-separated)
```

_See code: [lib/commands/compile/client.js](https://github.com/crossroads-education/eta-cli/blob/v1.3.0-a6/lib/commands/compile/client.js)_

## eta compile:server

compile server-side Typescript

```
USAGE
  $ eta compile:server

ALIASES
  $ eta compile
```

_See code: [lib/commands/compile/server.js](https://github.com/crossroads-education/eta-cli/blob/v1.3.0-a6/lib/commands/compile/server.js)_

## eta config:get [KEY]

log a config variable's value

```
USAGE
  $ eta config:get [KEY]

ARGUMENTS
  KEY  The key to get (including domain)
```

_See code: [lib/commands/config/get.js](https://github.com/crossroads-education/eta-cli/blob/v1.3.0-a6/lib/commands/config/get.js)_

## eta config:set [KEY] [VALUE]

set a config variable

```
USAGE
  $ eta config:set [KEY] [VALUE]

ARGUMENTS
  KEY    The key to set (including domain)
  VALUE  The value to set
```

_See code: [lib/commands/config/set.js](https://github.com/crossroads-education/eta-cli/blob/v1.3.0-a6/lib/commands/config/set.js)_

## eta db:reset

reset the database (using global connection info)

```
USAGE
  $ eta db:reset

OPTIONS
  -n, --no-wait  Don't wait 3 seconds before resetting
```

_See code: [lib/commands/db/reset.js](https://github.com/crossroads-education/eta-cli/blob/v1.3.0-a6/lib/commands/db/reset.js)_

## eta db:seed

seed the database (using global connection info)

```
USAGE
  $ eta db:seed

OPTIONS
  -n, --no-log  Don't log anything from the Eta instance
```

_See code: [lib/commands/db/seed.js](https://github.com/crossroads-education/eta-cli/blob/v1.3.0-a6/lib/commands/db/seed.js)_

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

_See code: [lib/commands/foreach.js](https://github.com/crossroads-education/eta-cli/blob/v1.3.0-a6/lib/commands/foreach.js)_

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
