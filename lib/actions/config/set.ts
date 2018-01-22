import * as fs from "fs-extra";
import * as _ from "lodash";
import * as path from "path";
import * as lib from "../..";

export default async function execute(args: string[]): Promise<boolean> {
    const keyTokens = args[0].split(".");
    const value = args[1];
    let configPath: string = undefined;
    let i: number;
    for (i = keyTokens.length; i > 0; i--) {
        configPath = keyTokens.slice(0, i).join("/");
        if (await fs.pathExists(lib.WORKING_DIR + "/config/" + configPath + ".json")) break;
        else configPath = undefined;
    }
    if (configPath === undefined) {
        const options: string[] = _.range(1, keyTokens.length).map(i => `${i}) ${keyTokens.slice(0, i).join("/")}.json`);
        i = NaN;
        while (isNaN(i)) {
            i = Number(await lib.question(`What configuration file would you like to create?\n` + options.join("\n") + "\nSelection) "));
        }
        configPath = keyTokens.slice(0, i).join("/");
    }
    await lib.transformJsonFile(lib.WORKING_DIR + "/config/" + configPath + ".json", config => {
        let item = config;
        keyTokens.slice(i, -1).forEach(t => item = item[t]);
        item[keyTokens[keyTokens.length - 1]] = value;
        return config;
    });
    console.log(`Successfully set ${args[0]} to ${value}`);
    return true;
}
