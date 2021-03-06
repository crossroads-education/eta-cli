import * as lib from "../../lib";
import * as oclif from "@oclif/command";

export default class LintClient extends oclif.Command {
    static description = "lint client-side Typescript for style errors";
    static flags = {
        "fix": oclif.flags.boolean({
            char: "f",
            description: "Passes --fix to tslint (attempt to automatically fix problems)",
            required: false
        }),
        "modules": oclif.flags.string({
            char: "m",
            description: "Only lint these modules (comma-separated)",
            required: false
        })
    };

    async run() {
        const { flags } = this.parse(LintClient);
        this.log("Linting client-side Typescript...");
        const staticDirs = await lib.eta.getModuleSubDirs(lib.WORKING_DIR, (flags.modules ? flags.modules.split(",") : []), "staticFiles");
        await Promise.all(staticDirs.map(d => lib.eta.lint(d + "/js", flags.fix, lib.WORKING_DIR)));
    }
}
