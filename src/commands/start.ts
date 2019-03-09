import * as lib from "../lib";
import * as oclif from "@oclif/command";

export default class Start extends oclif.Command {
    static description = "generate indexes, compile and start the server";
    static examples = [];
    static flags = {
        fast: oclif.flags.boolean({
            char: "f",
            description: "don't generate or compile, just start"
        }),
        local: oclif.flags.string({
            char: "e",
            env: 'NODE_ENV',
            options: ['local', 'dev', 'prod'],
            default: 'local',
            required: false,
            description: "set NODE_ENV; Right now, this affects Graylog logging"
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
