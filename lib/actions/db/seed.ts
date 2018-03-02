import * as lib from "../..";
import * as childProcess from "child_process";
import resetDB from "./reset";

export default async function execute(args: any[]): Promise<boolean> {
    let createdOwnServer = false;
    if (args.length === 0 || typeof(args[0]) !== "object") {
        await resetDB(["--no-wait"]);
        args[0] = await lib.startChildServer(!args.includes("--no-log"));
        createdOwnServer = true;
    }
    const serverProcess: childProcess.ChildProcess = args[0];
    await lib.sendChildMessage(serverProcess, "eta:cre:seed");
    if (createdOwnServer) serverProcess.kill();
    return true;
}
