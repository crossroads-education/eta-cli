
import * as fs from "fs-extra";
import * as lib from "../lib";
import * as oclif from "@oclif/command";

export default class Setup extends oclif.Command {
    static description = "set up a fresh Eta instance";

    async run() {
        this.log("Setting up a fresh Eta instance...");
        await lib.exec("npm install", { cwd: lib.WORKING_DIR });
        await oclif.run(["generate:indexes"]);
        await oclif.run(["compile:server"]);
        await Promise.all((await lib.recursiveReaddir(lib.WORKING_DIR + "/config"))
            .filter(f => f.endsWith(".sample.json"))
            .map(f => fs.copy(f, f.replace(/\.sample\.json$/, ".json"), { overwrite: false })));
        this.log("Please make sure to edit the generated config files!");
    }
}
