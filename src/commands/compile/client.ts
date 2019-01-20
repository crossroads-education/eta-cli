import * as fs from "fs-extra";
import * as lib from "../../lib";
import * as oclif from "@oclif/command";

export default class CompileClient extends oclif.Command {
    static description = "compile client-side Typescript";
    static flags = {
        "modules": oclif.flags.string({
            char: "m",
            description: "modules to compile client-side JS for (comma-separated)"
        }),
        "no-exit": oclif.flags.boolean({
            description: "Don't exit with an error code if compilation fails",
            required: false
        })
    };

    async run() {
        const { flags } = this.parse(CompileClient);
        const moduleNames: string[] = (flags.modules || "").split(",").map(m => m.trim());
        const workingModuleName = lib.eta.workingModuleName;
        if (moduleNames.length === 1 && moduleNames[0] === "") moduleNames.splice(0, 1); // resets to empty []
        if (moduleNames.length === 0 && !lib.IN_ETA_ROOT && workingModuleName !== undefined) {
            moduleNames.push(workingModuleName);
        }
        this.log("Installing client-side NPM packages and compiling...");
        const staticDirs = await lib.eta.getModuleSubDirs(lib.WORKING_DIR, moduleNames, "staticFiles");
        try {
            for (const staticDir of staticDirs) {
                const jsDir = staticDir + "/js";
                if (!await fs.pathExists(jsDir)) continue;
                await lib.exec("yarn install", { cwd: jsDir });
                console.log(`\tInstalling and compiling in "${jsDir}"...`);
                await lib.exec("node " + lib.TSC_PATH, {
                    cwd: jsDir
                });
            }
        } catch (err) {
            if (!err.stdout) throw err;
            process.stderr.write(err.stdout);
            if (!flags["no-exit"]) this.exit(1);
        }
    }
}
