import * as fs from "fs-extra";
import * as path from "path";
import * as lib from "../..";

export default async function execute(args: string[]): Promise<boolean> {
    const workingModuleName = lib.getWorkingModuleName();
    if (args.length === 1 && !lib.IN_ETA_ROOT && workingModuleName !== undefined) {
        args.splice(0, 0, workingModuleName);
    }
    const moduleName: string = args[0];
    let routeName: string = args[1];
    console.log(`Generating controller for "${routeName}" in ${moduleName}...`);
    if (routeName.startsWith("/")) {
        routeName = routeName.substring(1);
    }
    const moduleDir = lib.WORKING_DIR + "/modules/" + moduleName;
    if (!(await fs.pathExists(moduleDir + "/eta.json"))) {
        console.error(`The "eta.json" file is missing from the ${moduleName} module.`);
        return false;
    }
    let moduleConfig: {dirs: {controllers?: string[]}} = await fs.readJSON(moduleDir + "/eta.json");
    if (moduleConfig.dirs.controllers.length === 0) {
        moduleConfig = await lib.transformJsonFile(moduleDir + "/eta.json", obj => {
            obj.dirs.controllers = ["controllers"];
            return obj;
        });
    }
    const controllerPath = `${moduleDir}/${moduleConfig.dirs.controllers[0]}/${routeName}.ts`;
    const relPath: string = path.relative(path.dirname(controllerPath), moduleDir).replace(/\\/g, "/");
    const className: string = routeName
        .split("/")
        .map(t => t.substring(0, 1).toUpperCase() + t.substring(1))
        .join("");
    await fs.mkdirp(path.dirname(controllerPath));
    await fs.writeFile(controllerPath, `import * as eta from "${relPath}/eta";
import * as db from "${relPath}/db";

@eta.mvc.route("/${routeName}")
@eta.mvc.controller()
export default class ${className}Controller extends eta.IHttpController {
    @eta.mvc.get()
    public async index(): Promise<void> {
        // TODO: Implement
    }
}
`);
    return true;
}
