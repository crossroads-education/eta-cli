import * as _ from "lodash";
import * as lib from "../../lib";
import * as oclif from "@oclif/command";

export default class GenerateController extends oclif.Command {
    static description = "generate new controller";
    static args = [
        {
            name: "moduleName",
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
        const { moduleName, route } = args;
        const moduleDir = lib.WORKING_DIR + "/modules/" + moduleName;
        await lib.eta.generateAsset(moduleDir, "controllers", route, `import * as eta from "@eta/eta";

export default class ${_.upperFirst(_.camelCase(route))}Controller extends eta.HttpController {
    route = "${route}";
    async index() {
        // TODO: Implement
    }
}`);
        this.log("Generated controller " + route);
    }
}
