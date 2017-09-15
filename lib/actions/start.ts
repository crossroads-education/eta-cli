import * as childProcess from "child_process";
import * as fs from "fs-extra";
import * as path from "path";
import * as lib from "../";
import compileServer from "./compile/server";

export default async function execute(args: string[]): Promise<boolean> {
    const isFast: boolean = args.length === 1;
    if (!isFast) {
        if (!await compileServer(args, true)) {
            return false;
        }
    }
    const execLive = () => new Promise<boolean>((resolve, reject) => {
        const child = childProcess.exec("node server", { cwd: lib.WORKING_DIR }, (err, stdout, stderr) => {
            if (err) resolve(false);
            else resolve(true);
        });
        child.stdout.on("data", data => process.stdout.write(data.toString()));
        child.stderr.on("data", data => process.stderr.write(data.toString()));
    });
    return await execLive();
}
