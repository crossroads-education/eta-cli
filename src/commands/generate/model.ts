import * as lib from "../../lib";
import * as oclif from "@oclif/command";

export default class GenerateController extends oclif.Command {
    static description = "generate new TypeORM model";
    static args = [
        {
            name: "moduleName",
            description: "module name to generate controller in",
            required: true
        },
        {
            name: "modelName",
            description: "name for new model",
            required: true
        }
    ];

    async run() {
        const { args } = this.parse(GenerateController);
        const { moduleName, modelName } = args;
        const moduleDir = lib.WORKING_DIR + "/modules/" + moduleName;
        await lib.eta.generateAsset(moduleDir, "models", modelName, `import * as orm from "typeorm";

@orm.Entity()
export default class ${modelName.split("/").slice(-1)[0]} {
    @orm.PrimaryGeneratedColumn()
    id: number;
}`);
    }
}
