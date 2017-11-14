import * as fs from "fs-extra";
import * as path from "path";
import * as lib from "..";
import compileServer from "./compile/server";
import generateIndexes from "./generate/indexes";

export default async function execute(args: string[]): Promise<boolean> {
    console.log("Setting up fresh Eta instance...");
    await compileServer([], false); // required for HelperArray compilation
    await lib.exec("npm install");
    await generateIndexes([]);
    await compileServer([], false); // it'll throw unnecessary errors about db.ts, don't need to scare the user
    const configFiles: string[] = await lib.recursiveReaddir(lib.WORKING_DIR + "/config");
    await Promise.all(configFiles
        .filter(f => f.endsWith(".sample.json"))
        .map(f => fs.copy(f, f.replace(/\.sample\.json/g, ".json"), { overwrite: false }))
    );
    console.log("\tPlease make sure to edit the config files!");
    return true;
}
