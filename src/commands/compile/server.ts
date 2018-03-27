import * as lib from "../../lib";
import * as oclif from "@oclif/command";

export default class DBSeed extends oclif.Command {
    static examples = [];
    static flags = {};
    static args = [];
    static aliases = ["compile"];

    async run() {
        console.log("Compiling server JS...");
        try {
            await lib.exec(`node ${lib.TSC_PATH}`, {
                cwd: lib.WORKING_DIR
            });
        } catch (err) {
            process.stderr.write(err.stdout);
            this.exit(1);
        }
    }
}