import * as childProcess from "child_process";
import * as fs from "fs-extra";
import * as Github from "github";
import * as os from "os";
import * as path from "path";
import * as recursiveReaddirCallback from "recursive-readdir";
import * as util from "util";

export const CLI_DIR = path.join(__dirname, "../..").replace(/\\/g, "/");
export const DIST_DIR = path.join(CLI_DIR, "dist");
export const HOME_DIR = os.homedir().replace(/\\/g, "/");
export const COMPILER_PATH = CLI_DIR + "/node_modules/typescript/bin/tsc";
export const WORKING_DIR = process.cwd().replace(/\\/g, "/");

export const exec = util.promisify(childProcess.exec);
export const github = new Github({
    Promise,
    host: "api.github.com",
    protocol: "https"
});
export const recursiveReaddir: (path: string) => Promise<string[]> = <any>util.promisify(recursiveReaddirCallback);

export async function forEachClientJS(moduleNames: string[], worker: (jsDir: string) => Promise<boolean>): Promise<boolean> {
    if (moduleNames.length === 0) {
        moduleNames = await fs.readdir(WORKING_DIR + "/modules");
    }
    let success = true;
    for (const moduleName of moduleNames) {
        const moduleDir: string = WORKING_DIR + "/modules/" + moduleName;
        const moduleConfig: ModuleConfiguration = await fs.readJSON(moduleDir + "/eta.json");
        for (const staticDir of moduleConfig.dirs.staticFiles) {
            const jsDir = `${moduleDir}/${staticDir}/js`;
            if (!(await fs.pathExists(jsDir + "/tsconfig.json"))) {
                continue;
            }
            if (!await worker(jsDir)) {
                success = false;
            }
        }
    }
    return success;
}

export async function transformJsonFile(filename: string, worker: (original: any) => any): Promise<void> {
    return await fs.writeJSON(filename, worker(await fs.readJSON(filename)));
}

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
