import * as childProcess from "child_process";
import * as fs from "fs-extra";
import * as lib from "../..";
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
    await lib.sendChildMessage(serverProcess, "eta:cre:test");
    serverProcess.kill();
    return true;
}
