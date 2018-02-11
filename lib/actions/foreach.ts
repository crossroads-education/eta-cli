import * as fs from "fs-extra";
import * as os from "os";
import * as lib from "..";

export default async function execute(args: string[]): Promise<boolean> {
    let command: string = args.join(" ");
    if (command[0] === '"' && command[command.length - 1] === '"') {
        command = command.slice(1, -1);
    }
    if (os.platform() === "win32") {
        command = `powershell -Command "${command}"`;
    }
    const moduleNames: string[] = await fs.readdir(lib.WORKING_DIR + "/modules");
    try {
        for (const moduleName of moduleNames) {
            const {stdout, stderr} = await lib.exec(command, {
                cwd: lib.WORKING_DIR + "/modules/" + moduleName
            });
            if (stdout !== "") process.stdout.write(stdout);
            if (stderr !== "") process.stderr.write(stderr);
        }
    } catch (err) {
        process.stderr.write(err.stderr);
        return false;
    }
    return true;
}
