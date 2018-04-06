import * as fs from "fs-extra";
import * as os from "os";
import * as path from "path";

export const CLI_DIR = path.join(__dirname, "../..").replace(/\\/g, "/");
export const CLI_VERSION: string = fs.readJSONSync(CLI_DIR + "/package.json").version;
export const DIST_DIR = path.join(CLI_DIR, "dist");
export const HOME_DIR = os.homedir().replace(/\\/g, "/");
export const IN_ETA_ROOT = true;
export const MOCHA_PATH = path.dirname(require.resolve("mocha")) + "/bin/mocha";
export const TSC_PATH = path.dirname(require.resolve("typescript")) + "/../bin/tsc";
export const TSLINT_PATH = path.dirname(require.resolve("tslint")) + "/../bin/tslint";
// export const TYPINGS_PATH = require.resolve("typings");
export const WORKING_DIR = process.cwd().replace(/\\/g, "/");
