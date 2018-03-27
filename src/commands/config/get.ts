import * as fs from "fs-extra";
import * as lib from "../../lib";
import * as oclif from "@oclif/command";

export default class ConfigSet extends oclif.Command {
    static examples = [];
    static flags = {
    };
    static args = [{
        name: "key",
        description: "The key to set (including domain)"
    }];

    async run() {
        const { args } = this.parse(ConfigSet);
        const keyTokens: string[] = args.key.split(".");
        const configPath = (await lib.fs.getNearestFile(keyTokens, f => `${lib.WORKING_DIR}/config/${f}.json`));
        if (configPath === undefined) {
            return this.error("Can't find a matching configuration file for key " + args.key);
        }
        let item = await fs.readJSON(lib.WORKING_DIR + "/config/" + configPath + ".json");
        keyTokens.forEach(t => item = item[t]);
        this.log(item);
    }
}
