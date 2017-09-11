import * as fs from "fs-extra";
import * as lib from "../..";

async function compile(moduleName: string): Promise<boolean> {
    console.log("Compiling client-side JS...");
    const moduleDir: string = lib.WORKING_DIR + "/modules/" + moduleName;
    const staticFiles: string[] = (await fs.readJSON(moduleDir + "/eta.json")).dirs.staticFiles;
    let success = true;
    for (const staticDir of staticFiles) {
        const jsDir = `${moduleDir}/${staticDir}/js`;
        if (!(await fs.pathExists(jsDir + "/tsconfig.json"))) {
            continue;
        }
        try {
            await lib.exec("node " + lib.COMPILER_PATH, {
                cwd: jsDir
            });
        } catch (err) {
            console.error("Couldn't compile " + moduleName + ":");
            process.stderr.write(err);
            success = false;
        }
    }
    return success;
}

export default async function execute(allowedModuleNames: string[]): Promise<boolean> {
    let moduleNames: string[] = await fs.readdir(lib.WORKING_DIR + "/modules");
    if (allowedModuleNames.length > 0) {
        moduleNames = moduleNames.filter(name => allowedModuleNames.includes(name));
    }
    let success = true;
    for (const name of moduleNames) {
        console.log(`Compiling "${name}"...`);
        if (!(await compile(name))) {
            success = false;
        }
    }
    return success;
}
