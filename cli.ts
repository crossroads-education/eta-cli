import * as sourceMapSupport from "source-map-support";
sourceMapSupport.install();
import * as _ from "lodash";
import * as commander from "commander";
import * as fs from "fs-extra";
import * as lib from "./lib";
import * as path from "path";
import * as request from "request-promise";
import * as semver from "semver";

async function checkCurrentVersion(): Promise<void> {
    const packageInfo: {
        versions: {[key: string]: any};
    } = JSON.parse(await request.get("https://registry.npmjs.org/@xroadsed%2Feta-cli"));
    const latestVersion = <string>semver.sort(Object.keys(packageInfo.versions)).slice(-1)[0];
    if (latestVersion === lib.CLI_VERSION) return;
    console.warn("Please update your Eta CLI installation!");
    console.warn("\tCurrent version: " + lib.CLI_VERSION);
    console.warn("\tLatest version: " + latestVersion);
}

async function checkWorkingDir(): Promise<void> {
    const tokens = lib.WORKING_DIR.split("/");
    let isValid = false;
    let i = tokens.length;
    for (; i > 0; i--) {
        const workingDir = tokens.slice(0, i).join("/");
        try {
            if ((await fs.readJSON(workingDir + "/package.json")).name === "@xroadsed/eta") {
                isValid = true;
                break;
            }
        } catch { }
    }
    if (!isValid) {
        console.error("Please run the Eta CLI tool in the directory of an Eta v2.6+ instance.");
        process.exit(1);
    }
    const newWorkingDir = tokens.slice(0, i).join("/");
    (<any>lib).IN_ETA_ROOT = newWorkingDir === lib.WORKING_DIR;
    (<any>lib).WORKING_DIR = newWorkingDir;
}

export default async function main(args: string[]): Promise<boolean> {
    if (args.length === 0) {
        console.error("Usage: eta <subcommand> [options]");
        return false;
    }
    if (args[0] === "-v" || args[0] === "-version") {
        console.log("Project Eta CLI: v" + (await fs.readJSON(lib.CLI_DIR + "/package.json")).version);
        return true;
    }
    await Promise.all([checkCurrentVersion(), checkWorkingDir()]);
    let actionPath: string = undefined;
    let i: number;
    for (i = args.length; i > 0; i--) {
        actionPath = args.slice(0, i).join("/");
        if (await fs.pathExists(lib.DIST_DIR + "/lib/actions/" + actionPath + ".json")) break;
        else actionPath = undefined;
    }
    if (!actionPath) {
        console.error("Usage: eta <subcommand> [options]");
        return false;
    }
    return lib.executeCommand(actionPath, args.slice(i));
}
