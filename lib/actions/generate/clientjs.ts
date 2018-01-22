import * as fs from "fs-extra";
import * as path from "path";
import * as lib from "../..";
import compileClient from "../compile/client";
import generateIndexes from "./indexes";

export default async function execute(args: string[]): Promise<boolean> {
    const workingModuleName = lib.getWorkingModuleName();
    if (args.length === 0 && !lib.IN_ETA_ROOT && workingModuleName !== undefined) {
        args.push(workingModuleName);
    }
    const moduleName: string = args[0];
    const moduleDir: string = lib.WORKING_DIR + "/modules/" + moduleName;
    if (!(await fs.pathExists(moduleDir + "/eta.json"))) {
        console.error(`The "eta.json" file is missing from the ${moduleName} module.`);
        return false;
    }
    const jsDir = moduleDir + "/static/js";
    console.log("Initializing client-side JS for " + moduleName + "...");
    if (await fs.pathExists(jsDir)) {
        console.error("Client-side JS already exists for module " + moduleName + ".");
        return false;
    }
    await Promise.all([
        fs.mkdirp(jsDir),
        fs.copy(lib.CLI_DIR + "/templates/clientjs", jsDir + "/", { recursive: true }),
        lib.transformJsonFile(moduleDir + "/eta.json", info => {
            if ((info.dirs.static || []).length !== 0) return info;
            info.dirs.static = ["static"];
            return info;
        })
    ]);
    await lib.transformJsonFile(jsDir + "/package.json", info => {
        info.name = moduleName + "-js";
        return info;
    });
    await generateIndexes([]);
    await compileClient([moduleName]);
    return true;
}
