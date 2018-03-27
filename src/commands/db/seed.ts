import * as lib from "../../lib";
import * as oclif from "@oclif/command";

export default class DBSeed extends oclif.Command {
    static examples = [];
    static flags = {
        "no-log": oclif.flags.boolean({
            char: "n",
            description: "Don't log anything from the Eta instance"
        })
    };
    static args = [];

    async run() {
        const { flags } = this.parse(DBSeed);
        const server = new lib.EtaProcess(lib.WORKING_DIR, !flags["no-log"]);
        await server.start();
        await DBSeed.seed(server);
        server.process!.kill();
    }

    static async seed(server: lib.EtaProcess) {
        server.process!.send("eta:cre:seed");
        await server.waitForIPC(msg => msg === "eta:cre:seed");
    }
}
