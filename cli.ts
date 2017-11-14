import * as sourceMapSupport from "source-map-support";
sourceMapSupport.install();
import * as commander from "commander";
import * as fs from "fs-extra";
import * as lib from "./lib";
import * as path from "path";
import * as readline from "readline";

function printUsage(): void {
    console.log("Usage: eta <subcommand> [options]");
}

export default async function main(): Promise<boolean> {
    const args: string[] = process.argv.splice(2);
    if (args.length === 0) {
        printUsage();
        return false;
    }
    if (args[0] === "-v" || args[0] === "-version") {
        console.log("Project Eta CLI: v" + (await fs.readJSON(lib.CLI_DIR + "/package.json")).version);
        return true;
    }
    if (!await fs.pathExists(lib.WORKING_DIR + "/package.json") || (await fs.readJSON(lib.WORKING_DIR + "/package.json")).name !== "@xroadsed/eta") {
        console.error("Please run the Eta CLI tool in the root directory of an Eta v2.2+ instance.");
        return false;
    }
    if (args[0] === "install") {
        let config: {
            githubToken?: string;
        } = {};
        if (!await fs.pathExists(lib.HOME_DIR + "/.etaconfig")) {
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
            await fs.writeJSON(lib.HOME_DIR + "/.etaconfig", config);
        } else {
            config = await fs.readJSON(lib.HOME_DIR + "/.etaconfig");
        }
        lib.github.authenticate({
            "type": "token",
            "token": config.githubToken
        });
    }
    let actionPath: string = undefined;
    let i: number;
    for (i = args.length; i > 0; i--) {
        actionPath = lib.DIST_DIR + "/lib/actions/" + args.slice(0, i).join("/") + ".js";
        if (await fs.pathExists(actionPath)) break;
        else actionPath = undefined;
    }
    if (!actionPath) {
        printUsage();
        return false;
    }
    const action: (args: string[]) => Promise<boolean> = require(actionPath).default;
    if (!action) throw new Error(`Internal error: invalid action defined for "${action}"`);
    return await action(args.splice(i));
}
