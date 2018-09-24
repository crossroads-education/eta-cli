import * as fs from "fs-extra";
import * as lib from "../../lib";
import * as oclif from "@oclif/command";

export default class GenerateClientJS extends oclif.Command {
    static description = "generate new client-side JS setup";
    static args = [
        {
            name: "module",
            description: "module name to generate client-side JS for",
            required: true
        }
    ];

    async run() {
        const { args } = this.parse(GenerateClientJS);
        const moduleName: string = args.module;
        const moduleDir = lib.WORKING_DIR + "/modules/" + moduleName;
        if (!await fs.pathExists(moduleDir + "/eta.json")) {
            this.error(`The "eta.json" file is missing in ${moduleDir}.`);
            return;
        }
        const jsDir = moduleDir + "/static/js";
        this.log(`Initializing client-side JS for ${moduleName}...`);
        if (await fs.pathExists(jsDir)) {
            this.error(`Client-side JS already exists for ${moduleName}.`);
            return;
        }
        await fs.mkdirp(jsDir);
        await Promise.all([
            fs.copy(lib.CLI_DIR + "/templates/clientjs", jsDir + "/", { recursive: true }),
            lib.fs.transformJsonFile(moduleDir + "/eta.json", (info: any) => {
                if ((info.dirs.staticFiles || []).indexOf("static") !== -1) return info;
                info.dirs.staticFiles = (info.dirs.staticFiles || []).concat("static").sort();
                return info;
            })
        ]);
        await Promise.all([
            lib.fs.transformJsonFile(jsDir + "/package.json", (info: any) => {
                info.name = moduleName + "-client";
                return info;
            }),
            lib.exec("npm i", { cwd: jsDir })
        ]);
        await oclif.run(["generate:indexes"]);
        await oclif.run(["compile:client", "-m", moduleName]);
        this.log("Generated client-side JS for " + moduleName);
    }
}
