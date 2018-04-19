import * as lib from "../../lib";
import * as Mocha from "mocha";
import * as oclif from "@oclif/command";

export default class TestCore extends oclif.Command {
    static description = "run Eta's unit tests";
    static flags = {
        "reporter": oclif.flags.string({
            description: "reporter name for mocha to use",
            required: false
        })
    };
    static aliases = ["test"];

    async run() {
        const { flags } = this.parse(TestCore);
        const mocha = new Mocha();
        if (flags.reporter) mocha.reporter(flags.reporter);
        (await lib.recursiveReaddir(lib.WORKING_DIR + "/test")).filter(f => f.endsWith(".js"))
            .forEach(f => mocha.addFile(f));
        const failures = await new Promise<number>(resolve =>
            mocha.run(failures => resolve(failures)));
        if (failures > 0) this.exit(1);
    }
}
