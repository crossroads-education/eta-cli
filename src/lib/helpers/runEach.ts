import * as fs from "fs-extra";
import * as lib from "../";
import * as os from "os";

export async function runCommandForEachModule(command: string) {
    if (command[0] === '"' && command[command.length - 1] === '"') {
        command = command.slice(1, -1);
    }
    if (os.platform() === "win32") {
        command = `powershell -Command "${command}"`; // cmd doesn't handle ";"
    }
    const moduleNames = await fs.readdir(lib.WORKING_DIR + "/modules");
    for (const moduleName of moduleNames) {
        const {stdout, stderr} = await lib.exec(command, {
            cwd: lib.WORKING_DIR + "/modules/" + moduleName
        });
        if (stdout !== "") process.stdout.write(stdout);
        if (stderr !== "") process.stderr.write(stderr);
    }
}
