import * as oclif from "@oclif/command";
import { runCommandForEachModule } from "../lib/helpers/runEach";

export default class Foreach extends oclif.Command {
    static description = "run a command in each module directory";
    static examples = [];
    static flags = {
        clientJS: oclif.flags.string({
            char: "c",
            description: "run in client-side JS directories only"
        })
    };
    static args = [{
        name: "command",
        description: "The command to run in each directory"
    }];

    async run() {
        const { args } = this.parse(Foreach);
        try {
            await runCommandForEachModule(args.command);
        } catch (err) {
            process.stderr.write(err.stderr);
            this.exit(1);
        }
    }
}
