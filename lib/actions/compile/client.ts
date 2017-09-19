import * as fs from "fs-extra";
import * as lib from "../..";

async function compile(jsDir: string): Promise<boolean> {
    console.log(`\tCompiling "${jsDir}"...`);
    try {
        await lib.exec("node " + lib.TSC_PATH, {
            cwd: jsDir
        });
        return true;
    } catch (err) {
        process.stderr.write(err.stdout);
        return false;
    }
}

export default async function execute(moduleNames: string[]): Promise<boolean> {
    console.log("Compiling client-side JS...");
    return lib.forEachClientJS(moduleNames, compile);
}
