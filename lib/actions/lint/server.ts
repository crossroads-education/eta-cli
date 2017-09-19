import * as fs from "fs-extra";
import * as lib from "../..";

export function lint(shouldFix: boolean): (dir: string) => Promise<boolean> {
    let cmd = `node ${lib.TSLINT_PATH} -c ${lib.WORKING_DIR}/tslint.json -p tsconfig.json`;
    if (shouldFix) {
        cmd += " --fix";
    }
    return async dir => {
        try {
            await lib.exec(cmd, { cwd: dir });
        } catch (err) {
            process.stderr.write(err.stdout);
            return false;
        }
        return true;
    };
}

export default function execute(args: string[]): Promise<boolean> {
    console.log("Linting server-side JS...");
    return lint(args.length > 0)(lib.WORKING_DIR);
}
