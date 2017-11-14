import * as lib from "..";
import * as fs from "fs-extra";

export default async function execute(args: string[]): Promise<boolean> {
    const moduleName: string = args[0];
    if (!moduleName) {
        console.log("Usage: eta toggle <module-name>");
        return false;
    }
    const configFilename: string = lib.WORKING_DIR + "/config/modules/" + moduleName + ".json";
    await lib.transformJsonFile(configFilename, config => {
        config.disable = !config.disable;
        return config;
    });
    return true;
}
