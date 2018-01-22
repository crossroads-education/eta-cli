import * as lib from "..";
import * as fs from "fs-extra";

export default async function execute(args: string[]): Promise<boolean> {
    const workingModuleName = lib.getWorkingModuleName();
    if (args.length === 0 && !lib.IN_ETA_ROOT && workingModuleName !== undefined) {
        args.push(workingModuleName);
    }
    const configFilename: string = lib.WORKING_DIR + "/config/modules/" + args[0] + ".json";
    await lib.transformJsonFile(configFilename, config => {
        config.disable = !config.disable;
        return config;
    });
    return true;
}
