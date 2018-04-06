import * as fs from "fs-extra";
import * as lib from "../../lib";
import * as oclif from "@oclif/command";

export default class GenerateModule extends oclif.Command {
    static description = "generate new Eta module";
    static args = [
        {
            name: "module",
            description: "module name to generate",
            required: true
        }
    ];

    async run() {
        const { args } = this.parse(GenerateModule);
        const moduleName: string = args.module;
        const moduleDir = lib.WORKING_DIR + "/modules/" + moduleName;
        if (await fs.pathExists(moduleDir)) {
            return this.error(`Module ${moduleName} already exists.`);
        }
        await fs.mkdirp(moduleDir);
        await fs.copy(lib.CLI_DIR + "/templates/module", moduleDir + "/", { recursive: true });
        const fixName = (obj: any) => {
            obj.name = moduleName;
            return obj;
        };
        await Promise.all([
            lib.fs.transformJsonFile(moduleDir + "/eta.json", fixName),
            lib.fs.transformJsonFile(moduleDir + "/package.json", fixName),
            (async () => {
                if (await fs.pathExists(moduleDir + "/.npmignore")) {
                    await fs.move(moduleDir + "/.npmignore", moduleDir + "/.gitignore");
                }
            })()
        ]);
        await oclif.run(["generate:indexes"]);
        await lib.exec("git init", { cwd: moduleDir });
        await lib.exec("git add .", { cwd: moduleDir });
        await lib.exec(`git commit -m "Initial module setup"`, { cwd: moduleDir });
        this.log("Generated module " + moduleName);
    }
}
