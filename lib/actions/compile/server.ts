import * as lib from "../..";

export default async function execute(args: string[]): Promise<boolean> {
    console.log("Compiling server JS...");
    try {
        await lib.exec(`node ${lib.COMPILER_PATH}`, {
            cwd: lib.WORKING_DIR
        });
    } catch (err) {
        process.stderr.write(err.stdout);
        return false;
    }
    return true;
}
