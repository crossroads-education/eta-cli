# Project Eta CLI

## Installation

Run `npm i -g @xroadsed/eta-cli`.

## Commands

All commands should be run from the root directory of an Eta instance.

### Compilation / Linting

- `eta compile client`: Compiles all client files. (Previously `npm run compile-client`)
- `eta compile server`: Compiles all server files. (Previously `npm run compile`)
- `eta lint client`: Lints all client files (with `tslint`). (Previously `npm run lint`)
- `eta lint server`: Lints all server files (with `tslint`). (Previously `npm run lint-client`)
- `eta test`: Runs all unit tests for Eta core. (Previously `npm run test`)

### Generation

- `eta generate controller <module-name> <route>`: Generates a controller for `route` in `module-name`.
- `eta generate indexes`: Generates indexes and exports. (Previously `npm run generate`)
- `eta generate model <module-name> <name>`: Generates a model named `name` in `module-name`.
- `eta generate module <name>`: Generates an empty module named `name`.

### Setup / Management

- `eta install <module-url>`: Installs a module (and any dependencies) from the Git URL (or Github "username/repository") provided.
- `eta pull [module-name]`: Pulls the specified module (or all, if none is specified) from its remote, installs any new NPM modules, re-generates indexes, and compiles.
- `eta setup`: Sets up a cloned Eta instance.
- `eta start [fast]`: Regenerates, recompiles, and starts the Eta server. If the `fast` option is supplied, regeneration and recompilation will be skipped.
