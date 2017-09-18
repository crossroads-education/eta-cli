import * as fs from "fs-extra";
import * as lib from "../..";

async function compile(moduleName: string): Promise<boolean> {
    const moduleDir: string = lib.WORKING_DIR + "/modules/" + moduleName;
    const moduleConfig: lib.ModuleConfiguration = await fs.readJSON(moduleDir + "/eta.json");
    let success = true;
    for (const staticDir of moduleConfig.dirs.staticFiles) {
        const jsDir = `${moduleDir}/${staticDir}/js`;
        if (!(await fs.pathExists(jsDir + "/tsconfig.json"))) {
            continue;
        }
        try {
            await lib.exec("node " + lib.COMPILER_PATH, {
                cwd: jsDir
            });
        } catch (err) {
            process.stderr.write(err.stdout);
            success = false;
        }
    }
    return success;
}

export default async function execute(allowedModuleNames: string[]): Promise<boolean> {
    console.log("Compiling client-side JS...");
    let moduleNames: string[] = await fs.readdir(lib.WORKING_DIR + "/modules");
    if (allowedModuleNames.length > 0) {
        moduleNames = moduleNames.filter(name => allowedModuleNames.includes(name));
    }
    let success = true;
    for (const name of moduleNames) {
        console.log(`\tCompiling "${name}"...`);
        if (!(await compile(name))) {
            success = false;
        }
    }
    return success;
}
