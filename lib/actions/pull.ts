import * as fs from "fs-extra";
import * as path from "path";
import * as lib from "..";
import compileClient from "./compile/client";
import compileServer from "./compile/server";
import generateIndexes from "./generate/indexes";

export default async function execute(moduleNames: string[]): Promise<boolean> {
    console.log("Pulling " + ((moduleNames.length > 0) ? moduleNames.join(", ") : "all modules..."));
    if (moduleNames.length === 0) {
        moduleNames = await fs.readdir(lib.WORKING_DIR + "/modules");
    }
    const modulesChanged: string[] = [];
    for (const moduleName of moduleNames) {
        const moduleDir: string = lib.WORKING_DIR + "/modules/" + moduleName;
        if (!await fs.pathExists(moduleDir)) {
            console.warn("\tModule " + moduleName + " does not exist.");
            continue;
        }
        console.log("\tPulling module " + moduleName);
        try {
            const result = await lib.exec("git pull", { cwd: moduleDir });
            if (result.stdout === "Already up-to-date.\n") {
                continue;
            }
        } catch (err) {
            console.log("Couldn't pull " + moduleName + ":");
            process.stderr.write(err.stderr);
            return false;
        }
        console.log("\tModule " + moduleName + " had updates.");
        modulesChanged.push(moduleName);
        await lib.exec("npm install", { cwd: moduleDir });
    }
    if (modulesChanged.length > 0) {
        await generateIndexes([]);
        await compileServer([]);
        await compileClient(modulesChanged);
    }
    return true;
}
