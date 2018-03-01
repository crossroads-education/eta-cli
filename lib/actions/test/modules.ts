import * as childProcess from "child_process";
import * as crypto from "crypto";
import * as fs from "fs-extra";
import * as lib from "../..";
import * as Mocha from "mocha";
import * as request from "request-promise";
import resetDB from "../db/reset";
import seedDB from "../db/seed";

export default async function execute(args: string[]): Promise<boolean> {
    if (!await fs.pathExists(lib.WORKING_DIR + "/modules/cre-web-shared")) {
        console.error("You cannot run the module tests, since you don't have cre-web-shared installed (required for seeding data).");
        return false;
    }
    const shouldReset = args.includes("--reset");
    const shouldLogAll = args.includes("--log-all");
    if (shouldReset) await resetDB(["--no-wait"]);
    const serverProcess = await lib.startChildServer(shouldLogAll);
    if (shouldReset) await seedDB([serverProcess]);
    const mocha = new Mocha();
    const moduleDir = lib.WORKING_DIR + "/modules/";
    (await Promise.all<string[]>((await fs.readdir(moduleDir)).map(async f => {
        const testDir = moduleDir + f + "/test";
        if (!await fs.pathExists(testDir)) return [];
        return await lib.recursiveReaddir(testDir);
    }))).reduce((p, v) => p.concat(v), []).filter(f => f.endsWith(".js")).forEach(f => mocha.addFile(f));
    const db = await lib.connectDB();
    let apiToken = "";
    if (shouldReset) {
        const dbResult = await db.query("select user_id as id from user_position limit 1");
        apiToken = crypto.randomBytes(16).toString("hex");
        await db.query(`update "user" set "api_token" = $1::text where "id" = $2::int`, [apiToken, dbResult.rows[0].id]);
    } else {
        const dbResult = await db.query(`select api_token as "apiToken" from "user" where api_token is not null limit 1`);
        apiToken = dbResult.rows[0].apiToken;
    }
    process.env.API_TOKEN = apiToken;
    return await new Promise<boolean>((resolve, reject) => {
        mocha.run(failureCount => {
            serverProcess.kill();
            resolve(failureCount === 0);
        });
    });
}
