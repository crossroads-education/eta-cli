import * as lib from "../../lib";
import * as oclif from "@oclif/command";

export default class TestCore extends oclif.Command {
    static description = "run Eta's unit/integration tests";
    static flags = {
        "log-standard-output": oclif.flags.boolean({
            char: "l",
            description: "Write normal Mocha output to console (instead of CLI output)",
            required: false
        })
    };
    static aliases = ["test"];

    async run() {
        const { flags } = this.parse(TestCore);
        if (!flags["log-standard-output"]) this.log("Running tests on Eta core...");
        let result: {
            stdout: string;
            stderr: string;
        };
        try {
            result = await lib.exec(`node ${lib.MOCHA_PATH} --recursive`, {
                cwd: lib.WORKING_DIR,
                env: {
                    "ETA_logger_outputToConsole": false
                }
            });
        } catch (err) {
            process.stderr.write(err.stdout);
            return;
        }
        if (result.stderr) {
            process.stderr.write(result.stderr);
            return;
        }
        if (flags["log-standard-output"]) process.stdout.write(result.stdout);
        else this.log("All tests passed.");
    }
}
