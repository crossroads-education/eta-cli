import * as fs from "fs-extra";
import * as path from "path";
import * as lib from "../..";

export default async function execute(args: string[]): Promise<boolean> {
    if (args.length !== 2) {
        console.error("Usage: eta generate controller <module-name> <route>");
        return false;
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
    const moduleConfig: {dirs: {controllers?: string[]}} = await fs.readJSON(moduleDir + "/eta.json");
    if (moduleConfig.dirs.controllers.length === 0) {
        moduleConfig.dirs.controllers = ["controllers"];
        await fs.writeFile(moduleDir + "/eta.json", JSON.stringify(moduleConfig, undefined, 2));
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
