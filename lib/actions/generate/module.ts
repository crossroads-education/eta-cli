import * as fs from "fs-extra";
import * as path from "path";
import * as lib from "../..";
import generateIndexes from "./indexes";

export default async function execute(args: string[]): Promise<boolean> {
    const moduleName: string = args[0];
    const moduleDir: string = lib.WORKING_DIR + "/modules/" + moduleName;
    if (await fs.pathExists(moduleDir)) {
        console.error("Module " + moduleName + " already exists.");
        return false;
    }
    console.log("Initializing module " + moduleName + "...");
    await fs.mkdirp(moduleDir);
    await fs.copy(lib.CLI_DIR + "/module-template", moduleDir + "/", { recursive: true });
    const fixJsonName = (obj: any) => {
        obj.name = moduleName;
        return obj;
    };
    await lib.transformJsonFile(moduleDir + "/eta.json", fixJsonName);
    await lib.transformJsonFile(moduleDir + "/package.json", fixJsonName);
    if (await fs.pathExists(moduleDir + "/.npmignore")) {
        await fs.move(moduleDir + "/.npmignore", moduleDir + "/.gitignore");
    }
    await generateIndexes([]);
    await lib.exec("git init", { cwd: moduleDir });
    await lib.exec("git add .", { cwd: moduleDir });
    await lib.exec(`git commit -m "Initial module setup"`, { cwd: moduleDir });
    return true;
}
