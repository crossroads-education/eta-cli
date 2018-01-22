import * as fs from "fs-extra";
import * as path from "path";
import * as lib from "../..";

export default async function execute(args: string[]): Promise<boolean> {
    const workingModuleName = lib.getWorkingModuleName();
    if (args.length === 1 && !lib.IN_ETA_ROOT && workingModuleName !== undefined) {
        args.splice(0, 0, workingModuleName);
    }
    const moduleName: string = args[0];
    const modelName: string = args[1];
    console.log(`Generating model "${modelName}" in ${moduleName}...`);
    const moduleDir = lib.WORKING_DIR + "/modules/" + moduleName;
    if (!(await fs.pathExists(moduleDir + "/eta.json"))) {
        console.error(`The "eta.json" file is missing from the ${moduleName} module.`);
        return false;
    }
    const moduleConfig: {dirs: {models?: string[]}} = await fs.readJSON(moduleDir + "/eta.json");
    if (moduleConfig.dirs.models.length === 0) {
        moduleConfig.dirs.models = ["models"];
        await fs.writeFile(moduleDir + "/eta.json", JSON.stringify(moduleConfig, undefined, 2));
    }
    const modelPath = `${moduleDir}/${moduleConfig.dirs.models[0]}/${modelName}.ts`;
    const relPath: string = path.relative(path.dirname(modelPath), moduleDir).replace(/\\/g, "/");
    await fs.mkdirp(path.dirname(modelPath));
    await fs.writeFile(modelPath, `import * as orm from "typeorm";

@orm.Entity()
export default class ${modelName.split("/").slice(-1)[0]} {
    @orm.PrimaryGeneratedColumn()
    public id: number;
}
`);
    return true;
}
