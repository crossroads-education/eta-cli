# Project Eta CLI

The CLI for managing and developing with [Eta](https://github.com/crossroads-education/eta).
All commands should be run from the root directory of an Eta instance.

[![Version](https://img.shields.io/npm/v/@xroadsed/eta-cli.svg)](https://npmjs.org/package/@xroadsed/eta-cli)
[![CircleCI](https://circleci.com/gh/crossroads-education/eta-cli/tree/master.svg?style=shield)](https://circleci.com/gh/crossroads-education/eta-cli/tree/master)

<!-- toc -->
* [Project Eta CLI](#project-eta-cli)
<!-- tocstop -->
<!-- usage -->
```sh-session
$ npm install -g @xroadsed/eta-cli
$ eta COMMAND
running command...
$ eta (-v|--version|version)
@xroadsed/eta-cli/1.3.0 win32-x64 node-v8.9.1
$ eta --help [COMMAND]
USAGE
  $ eta COMMAND
...
```
<!-- usagestop -->
<!-- commands -->
* [eta clean](#eta-clean)
* [eta compile:client](#eta-compileclient)
* [eta compile:server](#eta-compileserver)
* [eta config:get [KEY]](#eta-configget-key)
* [eta config:set [KEY] [VALUE]](#eta-configset-key-value)
* [eta db:reset](#eta-dbreset)
* [eta db:seed](#eta-dbseed)
* [eta foreach [COMMAND]](#eta-foreach-command)
* [eta generate:clientjs MODULE](#eta-generateclientjs-module)
* [eta generate:controller MODULENAME ROUTE](#eta-generatecontroller-modulename-route)
* [eta generate:indexes](#eta-generateindexes)
* [eta generate:model MODULENAME MODELNAME](#eta-generatemodel-modulename-modelname)
* [eta generate:module MODULE](#eta-generatemodule-module)
* [eta help [COMMAND]](#eta-help-command)
* [eta install URL](#eta-install-url)
* [eta lint:client](#eta-lintclient)
* [eta lint:server](#eta-lintserver)
* [eta pull](#eta-pull)
* [eta setup](#eta-setup)
* [eta start](#eta-start)
* [eta test:core](#eta-testcore)
* [eta test:modules](#eta-testmodules)

## eta clean

clean all JS files without matching TS files

```
USAGE
  $ eta clean
```

_See code: [lib/commands/clean.js](https://github.com/crossroads-education/eta-cli/blob/v1.3.0/lib/commands/clean.js)_

## eta compile:client

compile client-side Typescript

```
USAGE
  $ eta compile:client

OPTIONS
  -m, --modules=modules  modules to compile client-side JS for (comma-separated)
  --no-exit              Don't exit with an error code if compilation fails
```

_See code: [lib/commands/compile/client.js](https://github.com/crossroads-education/eta-cli/blob/v1.3.0/lib/commands/compile/client.js)_

## eta compile:server

compile server-side Typescript

```
USAGE
  $ eta compile:server

OPTIONS
  --no-exit  Don't exit with an error code if compilation fails

ALIASES
  $ eta compile
```

_See code: [lib/commands/compile/server.js](https://github.com/crossroads-education/eta-cli/blob/v1.3.0/lib/commands/compile/server.js)_

## eta config:get [KEY]

log a config variable's value

```
USAGE
  $ eta config:get [KEY]

ARGUMENTS
  KEY  The key to get (including domain)
```

_See code: [lib/commands/config/get.js](https://github.com/crossroads-education/eta-cli/blob/v1.3.0/lib/commands/config/get.js)_

## eta config:set [KEY] [VALUE]

set a config variable

```
USAGE
  $ eta config:set [KEY] [VALUE]

ARGUMENTS
  KEY    The key to set (including domain)
  VALUE  The value to set
```

_See code: [lib/commands/config/set.js](https://github.com/crossroads-education/eta-cli/blob/v1.3.0/lib/commands/config/set.js)_

## eta db:reset

reset the database (using global connection info)

```
USAGE
  $ eta db:reset

OPTIONS
  -n, --no-wait  Don't wait 3 seconds before resetting
```

_See code: [lib/commands/db/reset.js](https://github.com/crossroads-education/eta-cli/blob/v1.3.0/lib/commands/db/reset.js)_

## eta db:seed

seed the database (using global connection info)

```
USAGE
  $ eta db:seed

OPTIONS
  -n, --no-log  Don't log anything from the Eta instance
```

_See code: [lib/commands/db/seed.js](https://github.com/crossroads-education/eta-cli/blob/v1.3.0/lib/commands/db/seed.js)_

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

_See code: [lib/commands/foreach.js](https://github.com/crossroads-education/eta-cli/blob/v1.3.0/lib/commands/foreach.js)_

## eta generate:clientjs MODULE

generate new client-side JS setup

```
USAGE
  $ eta generate:clientjs MODULE

ARGUMENTS
  MODULE  module name to generate client-side JS for
```

_See code: [lib/commands/generate/clientjs.js](https://github.com/crossroads-education/eta-cli/blob/v1.3.0/lib/commands/generate/clientjs.js)_

## eta generate:controller MODULENAME ROUTE

generate new controller

```
USAGE
  $ eta generate:controller MODULENAME ROUTE

ARGUMENTS
  MODULENAME  module name to generate controller in
  ROUTE       route to generate controller for
```

_See code: [lib/commands/generate/controller.js](https://github.com/crossroads-education/eta-cli/blob/v1.3.0/lib/commands/generate/controller.js)_

## eta generate:indexes

generate index files

```
USAGE
  $ eta generate:indexes

ALIASES
  $ eta generate
```

_See code: [lib/commands/generate/indexes.js](https://github.com/crossroads-education/eta-cli/blob/v1.3.0/lib/commands/generate/indexes.js)_

## eta generate:model MODULENAME MODELNAME

generate new TypeORM model

```
USAGE
  $ eta generate:model MODULENAME MODELNAME

ARGUMENTS
  MODULENAME  module name to generate controller in
  MODELNAME   name for new model
```

_See code: [lib/commands/generate/model.js](https://github.com/crossroads-education/eta-cli/blob/v1.3.0/lib/commands/generate/model.js)_

## eta generate:module MODULE

generate new Eta module

```
USAGE
  $ eta generate:module MODULE

ARGUMENTS
  MODULE  module name to generate
```

_See code: [lib/commands/generate/module.js](https://github.com/crossroads-education/eta-cli/blob/v1.3.0/lib/commands/generate/module.js)_

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

## eta install URL

install an Eta module

```
USAGE
  $ eta install URL

ARGUMENTS
  URL  url to install module from
```

_See code: [lib/commands/install.js](https://github.com/crossroads-education/eta-cli/blob/v1.3.0/lib/commands/install.js)_

## eta lint:client

lint client-side Typescript for style errors

```
USAGE
  $ eta lint:client

OPTIONS
  -f, --fix              Passes --fix to tslint (attempt to automatically fix problems)
  -m, --modules=modules  Only lint these modules (comma-separated)
```

_See code: [lib/commands/lint/client.js](https://github.com/crossroads-education/eta-cli/blob/v1.3.0/lib/commands/lint/client.js)_

## eta lint:server

lint server-side Typescript for style errors

```
USAGE
  $ eta lint:server

OPTIONS
  -f, --fix  Pass --fix to tslint (attempt to automatically fix problems)

ALIASES
  $ eta lint
```

_See code: [lib/commands/lint/server.js](https://github.com/crossroads-education/eta-cli/blob/v1.3.0/lib/commands/lint/server.js)_

## eta pull

pull all (or some) Eta modules from remote

```
USAGE
  $ eta pull

OPTIONS
  -m, --modules=modules  Module names to pull
```

_See code: [lib/commands/pull.js](https://github.com/crossroads-education/eta-cli/blob/v1.3.0/lib/commands/pull.js)_

## eta setup

set up a fresh Eta instance

```
USAGE
  $ eta setup
```

_See code: [lib/commands/setup.js](https://github.com/crossroads-education/eta-cli/blob/v1.3.0/lib/commands/setup.js)_

## eta start

generate indexes, compile and start the server

```
USAGE
  $ eta start

OPTIONS
  -f, --fast  don't generate or compile, just start
```

_See code: [lib/commands/start.js](https://github.com/crossroads-education/eta-cli/blob/v1.3.0/lib/commands/start.js)_

## eta test:core

run Eta's unit/integration tests

```
USAGE
  $ eta test:core

OPTIONS
  -l, --log-standard-output  Write normal Mocha output to console (instead of CLI output)

ALIASES
  $ eta test
```

_See code: [lib/commands/test/core.js](https://github.com/crossroads-education/eta-cli/blob/v1.3.0/lib/commands/test/core.js)_

## eta test:modules

run all module unit/integration tests

```
USAGE
  $ eta test:modules

OPTIONS
  -l, --log-all          log everything from server
  -r, --reset            reset / seed the database before running tests
  -s, --slow=slow        [default: 1000] max time until Mocha flags a test as slow (ms)
  -t, --timeout=timeout  [default: 3000] max time until Mocha kills a test (ms)
```

_See code: [lib/commands/test/modules.js](https://github.com/crossroads-education/eta-cli/blob/v1.3.0/lib/commands/test/modules.js)_
<!-- commandsstop -->
