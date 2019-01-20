
import * as fs from "fs-extra";
import * as lib from "../lib";
import * as oclif from "@oclif/command";
import { runCommandForEachModule } from "../lib/helpers/runEach";

export default class Setup extends oclif.Command {
    static description = "set up a fresh Eta instance";

    async run() {
        this.log("Setting up a fresh Eta instance...");
        this.log("\tRunning 'npm install' in the project directory.");
        await lib.exec("npm install", { cwd: lib.WORKING_DIR });
        try {
            this.log("\tRunning 'npm install' in all module directories.");
            await runCommandForEachModule('"npm install"');
        } catch (err) {
            process.stderr.write(err.stderr);
            this.exit(1);
        }
        this.log("\tGenerating indicies.");
        await oclif.run(["generate:indexes"]);
        this.log("\tCompiling the server-side code.");
        await oclif.run(["compile:server"]);
        this.log("\Copying .sample.json to .json files in all config directories.");
        await Promise.all((await lib.recursiveReaddir(lib.WORKING_DIR + "/config"))
            .filter(f => f.endsWith(".sample.json"))
            .map(f => fs.copy(f, f.replace(/\.sample\.json$/, ".json"), { overwrite: false })));
        this.log("Please make sure to edit the generated config files!");
        this.log("Run 'npx eta compile:client' to compile all client-side code.");
    }
}
