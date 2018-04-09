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
            description: "log everything from server"
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
            timeout: Number(flags.reset)
        });
        const modulesDir = lib.WORKING_DIR + "/modules/";
        (await Promise.all((await fs.readdir(modulesDir)).map(async d => {
            const testDir = modulesDir + d + "/test";
            if (!await fs.pathExists(testDir)) return [];
            return await lib.recursiveReaddir(testDir);
        }))).reduce((p, v) => p.concat(v), []).filter(f => f.endsWith(".js")).forEach(f => mocha.addFile(f));
        const db = await lib.eta.connectDatabase(lib.WORKING_DIR);
        let apiToken = "";
        if (flags.reset) {
            const result = await db.query(`select user_id as id from user_position where start <= current_date and ("end" is null or "end" > current_date) limit 1`);
            apiToken = crypto.randomBytes(16).toString("hex");
            await db.query(`update "user" set "api_token" = $1::text where "id" = $2::int`, [apiToken, result.rows[0].id]);
        } else {
            const result = await db.query(`select api_token as "apiToken" from "user" where api_token is not null limit 1`);
            apiToken = result.rows[0].apiToken;
        }
        require(lib.WORKING_DIR + "/helpers/require.js"); // set up support for require("@eta/...")
        process.env.API_TOKEN = apiToken;
        await new Promise(resolve => {
            mocha.run(() => {
                server.process!.kill("SIGINT");
                resolve();
            });
        });
    }
}
