import * as lib from "../../lib";
import * as oclif from "@oclif/command";

export default class GenerateIndexes extends oclif.Command {
    static description = "generate index files";
    static flags = {
        "fix": oclif.flags.boolean({
            char: "f",
            description: "Pass --fix to tslint (attempt to automatically fix problems)",
            required: false
        })
    };
    static aliases = ["lint"];

    async run() {
        const { flags } = this.parse(GenerateIndexes);
        this.log("Linting server-side Typescript...");
        await lib.eta.lint(lib.WORKING_DIR, flags.fix);
    }
}
