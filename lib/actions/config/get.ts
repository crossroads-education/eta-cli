import * as fs from "fs-extra";
import * as _ from "lodash";
import * as path from "path";
import * as lib from "../..";

export default async function execute(args: string[]): Promise<boolean> {
    const keyTokens = args[0].split(".");
    let configPath: string = undefined;
    let i: number;
    for (i = keyTokens.length; i > 0; i--) {
        configPath = keyTokens.slice(0, i).join("/");
        if (await fs.pathExists(lib.WORKING_DIR + "/config/" + configPath + ".json")) break;
        else configPath = undefined;
    }
    if (configPath === undefined) {
        console.error("Can't find a matching configuration file for key " + args[0]);
        return false;
    }
    let item = await fs.readJSON(lib.WORKING_DIR + "/config/" + configPath + ".json");
    keyTokens.slice(i).forEach(t => item = item[t]);
    console.log(item);
    return true;
}
