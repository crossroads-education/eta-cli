import * as sourceMapSupport from "source-map-support";
sourceMapSupport.install();
import * as commander from "commander";
import * as fs from "fs-extra";
import * as lib from "./lib";
import * as path from "path";

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
    let actionPath: string = undefined;
    let i: number;
    for (i = 0; i < args.length; i++) {
        actionPath = lib.DIST_DIR + "/lib/actions/" + args.slice(0, i + 1).join("/") + ".js";
        if (await fs.pathExists(actionPath)) break;
        else actionPath = undefined;
    }
    if (!actionPath) {
        printUsage();
        return false;
    }
    const action: (args: string[]) => Promise<boolean> = require(actionPath).default;
    if (!action) throw new Error(`Internal error: invalid action defined for "${action}"`);
    return await action(args.splice(i + 1));
}
