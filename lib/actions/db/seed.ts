import * as lib from "../..";
import * as childProcess from "child_process";
import resetDB from "./reset";

export default async function execute(args: any[]): Promise<boolean> {
    let createdOwnServer = false;
    if (args.length === 0 || typeof(args[0]) !== "object") {
        args[0] = await lib.startChildServer(true);
        createdOwnServer = true;
    }
    if (createdOwnServer) await resetDB(["--no-wait"]);
    const serverProcess: childProcess.ChildProcess = args[0];
    await lib.sendChildMessage(serverProcess, "eta:cre:seed");
    if (createdOwnServer) serverProcess.kill();
    return true;
}
