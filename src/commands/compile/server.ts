import * as lib from "../../lib";
import * as oclif from "@oclif/command";

export default class CompileServer extends oclif.Command {
    static description = "compile server-side Typescript";
    static examples = [];
    static flags = {
        "no-exit": oclif.flags.boolean({
            description: "Don't exit with an error code if compilation fails",
            required: false
        })
    };
    static args = [];
    static aliases = ["compile"];

    async run() {
        const { flags } = this.parse(CompileServer);
        console.log("Compiling server JS...");
        try {
            await lib.exec(`node ${lib.TSC_PATH}`, {
                cwd: lib.WORKING_DIR
            });
        } catch (err) {
            process.stderr.write(err.stdout);
            if (!flags["no-exit"]) this.exit(1);
        }
    }
}
