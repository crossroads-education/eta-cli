import * as lib from "../lib";
import * as oclif from "@oclif/command";

export default class Start extends oclif.Command {
    static description = "generate indexes, compile and start the server";
    static examples = [];
    static flags = {
        fast: oclif.flags.boolean({
            char: "f",
            description: "don't generate or compile, just start"
        })
    };

    async run() {
        const { flags } = this.parse(Start);
        if (!flags.fast) {
            await oclif.run(["generate:indexes"]);
            await oclif.run(["compile:server"]);
        }
        const server = new lib.EtaProcess(lib.WORKING_DIR, true);
        await server.start();
    }
}
