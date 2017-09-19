import * as lib from "../..";

export default async function execute(args: string[], logError = true): Promise<boolean> {
    console.log("Compiling server JS...");
    try {
        await lib.exec(`node ${lib.TSC_PATH}`, {
            cwd: lib.WORKING_DIR
        });
    } catch (err) {
        if (logError) process.stderr.write(err.stdout);
        return false;
    }
    return true;
}
