import * as crypto from "crypto";
import * as fs from "fs-extra";
import * as lib from "../../lib";
import * as Mocha from "mocha";
import * as oclif from "@oclif/command";
import DBSeed from "../db/seed";

export default class TestModules extends oclif.Command {
    static description = "run all module unit/integration tests";
    static flags = {
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
            default: "1000"
        }),
        "timeout": oclif.flags.string({
            char: "t",
            description: "max time until Mocha kills a test (ms)",
            required: false,
            default: "3000"
        })
    };

    async run() {
        const { flags } = this.parse(TestModules);
        if (flags.reset) await oclif.run(["db:reset", "--no-wait"]);
        const server = new lib.EtaProcess(lib.WORKING_DIR, flags["log-all"]);
        await server.start();
        if (flags.reset) await DBSeed.seed(server);
        const mocha = new Mocha({
            slow: Number(flags.slow),
            timeout: Number(flags.timeout),
        });
        if (flags.reporter) mocha.reporter(flags.reporter);
        const modulesDir = lib.WORKING_DIR + "/modules/";
        const allowedModules = flags.modules ? flags.modules.split(",") : [];
        const moduleNames = (await fs.readdir(modulesDir)).filter(d => (!flags.modules) || allowedModules.includes(d));
        // add all files in modules/*/test/ to Mocha
        (await Promise.all(moduleNames.map(async d => {
            const testDir = modulesDir + d + "/test";
            if (!await fs.pathExists(testDir)) return [];
            return await lib.recursiveReaddir(testDir);
        }))).reduce((p, v) => p.concat(v), []).filter(f => f.endsWith(".js")).forEach(f => mocha.addFile(f));
        const db = await lib.eta.connectDatabase(lib.WORKING_DIR);
        let apiToken = "";
        if (flags.reset) { // add a new API token to fresh DB
            const result = await db.query(`select user_id as id from user_position where start <= current_date and ("end" is null or "end" > current_date) limit 1`);
            apiToken = crypto.randomBytes(16).toString("hex");
            await db.query(`update "user" set "api_token" = $1::text where "id" = $2::int`, [apiToken, result.rows[0].id]);
        } else { // get the previously-set API token
            const result = await db.query(`select api_token as "apiToken" from "user" where api_token is not null limit 1`);
            apiToken = result.rows[0].apiToken;
        }
        require(lib.WORKING_DIR + "/helpers/require.js"); // set up support for require("@eta/...")
        process.env.API_TOKEN = apiToken;
        await db.end();
        const failures = await new Promise<number>(resolve => {
            mocha.run(failures => {
                resolve(failures);
            });
        });
        server.process!.kill();
        if (failures !== 0) this.exit(1);
    }
}
