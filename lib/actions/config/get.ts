import * as fs from "fs-extra";
import * as _ from "lodash";
import * as path from "path";
import * as lib from "../..";

export default async function execute(args: string[]): Promise<boolean> {
    const keyTokens = args[0].split(".");
    const configPath: string = await lib.getNearestFile(keyTokens, f => `${lib.WORKING_DIR}/config/${f}.json`);
    if (configPath === undefined) {
        console.error("Can't find a matching configuration file for key " + args[0]);
        return false;
    }
    let item = await fs.readJSON(lib.WORKING_DIR + "/config/" + configPath + ".json");
    keyTokens.forEach(t => item = item[t]);
    console.log(item);
    return true;
}
