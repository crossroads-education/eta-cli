import * as lib from "../../lib";
import * as _ from "lodash";
import * as oclif from "@oclif/command";

export default class ConfigSet extends oclif.Command {
    static description = "set a config variable";
    static examples = [];
    static flags = {
    };
    static args = [{
        name: "key",
        description: "The key to set (including domain)"
    }, {
        name: "value",
        description: "The value to set"
    }];

    async run() {
        const { args } = this.parse(ConfigSet);
        const keyTokens: string[] = args.key.split(".");
        const value: string = args.value;
        let configPath: string = (await lib.fs.getNearestFile(keyTokens, f => `${lib.WORKING_DIR}/config/${f}.json`))!;
        if (configPath === undefined) {
            const options: string[] = _.range(1, keyTokens.length).map(i => `${i}) ${keyTokens.slice(0, i).join("/")}.json`);
            let i: number;
            do {
                i = Number(await lib.question(`Which configuration file would you like to create?\n${options.join("\n")}\nSelection) `));
            } while (isNaN(i));
            configPath = keyTokens.splice(0, i).join("/");
        }
        await lib.fs.transformJsonFile(lib.WORKING_DIR + "/config/" + configPath + ".json", (config: any) => {
            let item = config;
            keyTokens.slice(0, -1).forEach(t => item = item[t] = item[t] || {});
            item[keyTokens[keyTokens.length - 1]] = value;
            return config;
        });
        console.log(`Successfully set ${args.key} to ${args.value}`);
    }
}
