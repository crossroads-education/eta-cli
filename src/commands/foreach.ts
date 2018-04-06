import * as fs from "fs-extra";
import * as lib from "../lib";
import * as oclif from "@oclif/command";
import * as os from "os";

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
        let command: string = args.command;
        if (command[0] === '"' && command[command.length - 1] === '"') {
            command = command.slice(1, -1);
        }
        if (os.platform() === "win32") {
            command = `powershell -Command "${command}"`; // cmd doesn't handle ";"
        }
        const moduleNames = await fs.readdir(lib.WORKING_DIR + "/modules");
        try {
            for (const moduleName of moduleNames) {
                const {stdout, stderr} = await lib.exec(command, {
                    cwd: lib.WORKING_DIR + "/modules/" + moduleName
                });
                if (stdout !== "") process.stdout.write(stdout);
                if (stderr !== "") process.stderr.write(stderr);
            }
        } catch (err) {
            process.stderr.write(err.stderr);
            this.exit(1);
        }
    }
}
