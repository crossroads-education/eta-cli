import * as childProcess from "child_process";
import * as path from "path";
import * as recursiveReaddirCallback from "recursive-readdir";
import * as util from "util";

export const CLI_DIR = path.join(__dirname, "../..").replace(/\\/g, "/");
export const DIST_DIR = path.join(CLI_DIR, "dist");
export const COMPILER_PATH = CLI_DIR + "/node_modules/typescript/bin/tsc";
export const WORKING_DIR = process.cwd().replace(/\\/g, "/");

export const exec = util.promisify(childProcess.exec);
export const recursiveReaddir: (path: string) => Promise<string[]> = <any>util.promisify(recursiveReaddirCallback);
