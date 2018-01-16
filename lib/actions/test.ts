import * as lib from "..";

export default async function execute(args: string[], logError = true): Promise<boolean> {
    const shouldLogStandardOutput = args.includes("--standard-output");
    if (!shouldLogStandardOutput) console.log("Running tests on Eta core...");
    try {
        const result = await lib.exec(`node ${lib.MOCHA_PATH} --recursive`, {
            cwd: lib.WORKING_DIR
        });
        if (result.stderr) {
            process.stderr.write(result.stderr);
        } else {
            if (shouldLogStandardOutput) {
                process.stdout.write(result.stdout);
            } else {
                console.log("All tests passed.");
            }
        }
    } catch (err) {
        if (logError) process.stderr.write(err.stdout);
        return false;
    }
    return true;
}
