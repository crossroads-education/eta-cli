# Project Eta CLI

## Installation

Run `npm i -g @xroadsed/eta-cli`.

## Commands

All commands should be run from the root directory of an Eta instance.

### Compilation

- `eta compile client`: Compiles all client files. (Previously `npm run compile-client`)
- `eta compile server`: Compiles all server files. (Previously `npm run compile`)

### Generation

- `eta generate controller <module-name> <route>`: Generates a controller for `route` in `module-name`.
- `eta generate indexes`: Generates indexes and exports. (Previously `npm run generate`)

### Setup / Management

- `eta install <module-url>`: Installs a module (and any dependencies) from the Git URL provided.

## Commands to be implemented

### Generation

- `eta generate helper <module-name> <name>`: Generates a helper class named `name` in `module-name`. Prepends "Helper" to the name.
- `eta generate lifecycle <module-name> <name>`: Generates an ILifecycleHandler named `name` in `module-name`. Appends "Handler" to the name.
- `eta generate model <module-name> <name>`: Generates a model named `name` in `module-name`.
- `eta generate module <name>`: Generates an empty module named `name`.
- `eta generate request <module-name> <name>`: Generates an IRequestTransformer named `name` in `module-name`. Appends "Transformer" to the name.

### Setup / Management

- `eta pull [module-name]`: Pulls the specified module (or all, if none is specified) from its remote, installs any new modules or Eta dependencies, and compiles.
- `eta setup`: Clones a new Eta instance to the current directory.
- `eta start [fast]`: Regenerates, recompiles, and starts the Eta server. If the `fast` option is supplied, regeneration and recompilation will be skipped.
