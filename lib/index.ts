import * as childProcess from "child_process";
import * as fs from "fs-extra";
import * as Github from "github";
import * as _ from "lodash";
import * as os from "os";
import * as path from "path";
import * as readline from "readline";
import * as recursiveReaddirCallback from "recursive-readdir";
import * as util from "util";
import { ActionMetadata } from "./interfaces/ActionMetadata";
import ModuleConfiguration from "@xroadsed/eta/server/api/interfaces/ModuleConfiguration";

export * from "./interfaces/ActionMetadata";
export { default as ModuleConfiguration } from "@xroadsed/eta/server/api/interfaces/ModuleConfiguration";

export const CLI_DIR = path.join(__dirname, "../..").replace(/\\/g, "/");
export const CLI_VERSION: string = fs.readJSONSync(CLI_DIR + "/package.json").version;
export const DIST_DIR = path.join(CLI_DIR, "dist");
export const HOME_DIR = os.homedir().replace(/\\/g, "/");
export const IN_ETA_ROOT = true;
export const MOCHA_PATH = path.dirname(require.resolve("mocha")) + "/bin/mocha";
export const TSC_PATH = path.dirname(require.resolve("typescript")) + "/../bin/tsc";
export const TSLINT_PATH = path.dirname(require.resolve("tslint")) + "/../bin/tslint";
export const TYPINGS_PATH = require.resolve("typings");
export const WORKING_DIR = process.cwd().replace(/\\/g, "/");

export const exec = util.promisify(childProcess.exec);
export const github = new Github({
    Promise,
    host: "api.github.com",
    protocol: "https"
});
export const recursiveReaddir: (path: string) => Promise<string[]> = <any>util.promisify(recursiveReaddirCallback);

export function getWorkingModuleName(): string {
    const tokens: string[] = process.cwd().replace(/\\/g, "/").split("/");
    return tokens.reverse()[tokens.reverse().findIndex(t => t === "modules") + 1];
}

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

export async function transformJsonFile<T, U>(filename: string, worker: (original: any) => any): Promise<any> {
    const contents: T = await fs.pathExists(filename) ? await fs.readJSON(filename) : {};
    const newContents: U = worker(contents);
    await fs.writeFile(filename, JSON.stringify(newContents, undefined, 2));
    return newContents;
}

async function setupGithubToken(): Promise<void> {
    let config: { githubToken?: string; } = {};
    if (!await fs.pathExists(HOME_DIR + "/.etaconfig")) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        await (new Promise((resolve, reject) => {
            console.log("Your Github personal access token can be created with this guide: https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/");
            rl.question("Enter your Github personal access token: ", token => {
                config.githubToken = token;
                resolve();
            });
        }));
        await fs.writeJSON(HOME_DIR + "/.etaconfig", config);
    } else {
        config = await fs.readJSON(HOME_DIR + "/.etaconfig");
    }
    github.authenticate({
        "type": "token",
        "token": config.githubToken
    });
}

export async function executeCommand(metadataPath: string, actionParams: string[]): Promise<boolean> {
    const actionPath = DIST_DIR + "/lib/actions/" + metadataPath + ".json";
    const metadata: ActionMetadata = _.defaults<ActionMetadata, ActionMetadata>(await fs.readJSON(actionPath), {
        requiresGithubToken: false,
        requiredParamCount: 0,
        redirect: undefined,
        usage: ""
    });
    if (metadata.redirect) return await executeCommand(metadata.redirect.replace(/\ /g, "/"), actionParams);
    if (metadata.requiresGithubToken) await setupGithubToken();
    if (actionParams.length < metadata.requiredParamCount) {
        console.error("Usage: eta " + metadataPath.replace(/\//g, " ") + " " + metadata.usage);
        return false;
    }
    const action: (args: string[]) => Promise<boolean> = require(actionPath.slice(0, -2)).default;
    if (!action) throw new Error(`Internal error: invalid action defined for "${metadataPath.replace(/\//g, " ")}"`);
    return await action(actionParams);
}
