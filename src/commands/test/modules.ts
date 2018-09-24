import * as fs from "fs-extra";
import * as lib from "../../lib";
import * as Mocha from "mocha";
import * as oclif from "@oclif/command";
import DBSeed from "../db/seed";

export default class TestModules extends oclif.Command {
    static description = "run all module unit/integration tests";
    static flags = {
        "fast": oclif.flags.boolean({
            char: "f",
            description: "don't start the server, just run tests",
            required: false
        }),
        "log-all": oclif.flags.boolean({
            char: "l",
            description: "log everything from server",
            required: false
        }),
        "modules": oclif.flags.string({
            char: "m",
            description: "only test these modules (comma-separated)",
            required: false
        }),
        "reporter": oclif.flags.string({
            description: "reporter name for mocha to use",
            required: false
        }),
        "reset": oclif.flags.boolean({
            char: "r",
            description: "reset / seed the database before running tests",
            required: false
        }),
        "slow": oclif.flags.string({
            char: "s",
            description: "max time until Mocha flags a test as slow (ms)",
            required: false,
            default: "1500"
        }),
        "timeout": oclif.flags.string({
            char: "t",
            description: "max time until Mocha kills a test (ms)",
            required: false,
            default: "5000"
        })
    };

    async run() {
        const { flags } = this.parse(TestModules);
        if (flags.reset) await oclif.run(["db:reset", "--no-wait"]);
        let server: lib.EtaProcess | undefined;
        if (!flags.fast) {
            server = new lib.EtaProcess(lib.WORKING_DIR, flags["log-all"]);
            await server.start();
            if (flags.reset) await DBSeed.seed(server);
        }
        const ormConnection = await lib.eta.connectORM(lib.WORKING_DIR);
        // NOTE to use this without compilation errors, add `declare const orm: db.RepositoryManager;` in your test file
        (<any>global).orm = new (require(lib.WORKING_DIR + "/db.js").RepositoryManager)(ormConnection);
        const mocha = new Mocha({
            slow: Number(flags.slow),
            timeout: Number(flags.timeout)
        });
        if (flags.reporter) mocha.reporter(flags.reporter);
        const modulesDir = lib.WORKING_DIR + "/modules/";
        const allowedModules = flags.modules ? flags.modules.split(",") : [];
        const moduleNames = (await fs.readdir(modulesDir)).filter(d => (!flags.modules) || allowedModules.includes(d));
        // add all files in modules/*/test/ to Mocha
        (await Promise.all(moduleNames.map(async d => {
            const testDir = modulesDir + d + "/test";
            if (!await fs.pathExists(testDir)) return [];
            return lib.recursiveReaddir(testDir);
        }))).reduce((p, v) => p.concat(v), []).filter(f => f.endsWith(".js")).forEach(f => mocha.addFile(f));
        require(lib.WORKING_DIR + "/helpers/require.js"); // set up support for require("@eta/...")
        const failures = await new Promise<number>(resolve => {
            mocha.run(failures => {
                resolve(failures);
            });
        });
        if (!flags.fast) server!.process!.kill();
        await ormConnection.close();
        if (failures !== 0) this.exit(1);
    }
}
