import * as fs from "fs-extra";
import * as _ from "lodash";
import * as lib from "../../lib";
import * as oclif from "@oclif/command";
import * as path from "path";

export default class GenerateController extends oclif.Command {
    static description = "generate new controller";
    static args = [
        {
            name: "module",
            description: "module name to generate controller in",
            required: true
        },
        {
            name: "route",
            description: "route to generate controller for",
            required: true
        }
    ];

    async run() {
        const { args } = this.parse(GenerateController);
        const moduleName: string = args.module;
        let route: string = args.route;
        if (route.startsWith("/")) route = route.substring(1);
        const moduleDir = lib.WORKING_DIR + "/modules/" + moduleName;
        if (!await fs.pathExists(moduleDir + "/eta.json")) {
            return this.error(`The "eta.json" file is missing from module ${moduleName}.`);
        }
        const controllerDirs = (await lib.fs.transformJsonFile(moduleDir + "/eta.json", (obj: {
            dirs: { controllers: string[]; };
        }) => {
            obj.dirs.controllers = obj.dirs.controllers || [];
            if (obj.dirs.controllers.length === 0) obj.dirs.controllers.push("controllers");
            return obj;
        })).dirs.controllers;
        const controllerPath = `${moduleDir}/${controllerDirs[0]}/${route}.ts`;
        await fs.mkdirp(path.dirname(controllerPath));
        await fs.writeFile(controllerPath, `import * as eta from "@eta/eta";

export default class ${_.upperFirst(_.camelCase(route))}Controller extends eta.HttpController {
    route = "${route}";
    async index() {
        // TODO: Implement
    }
}`);
    }
}
