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

export interface ModuleConfiguration {
    /**
     * Directory definitions for various item types
     */
    dirs: {
        controllers: string[];
        models: string[];
        staticFiles: string[];
        views: string[];
        // hooks and handlers
        lifecycleHandlers: string[];
        requestTransformers: string[];
    };
    /**
     * CSS redirect mappings
     */
    css: {[key: string]: string};
    /**
     * The actual name of the module (in filesystem as well)
     */
    name: string;
    /**
     * Redirect definitions (i.e., "/home/index": "/home/otherPage" would redirect from index to otherPage)
     */
    redirects: {[key: string]: string};
    /**
     * Absolute path to module directory.
     * Generated on module load by ModuleLoader.
     */
    rootDir: string;
    /**
     * Modules that this module requires.
     * Format: username/repository
     * Only Github repositories are supported.
     */
    dependencies: string[];
    hooks: {[key: string]: {cwd: string, exec: string}[]};
    [key: string]: any;
}
