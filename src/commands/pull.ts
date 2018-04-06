import * as fs from "fs-extra";
import * as lib from "../lib";
import * as oclif from "@oclif/command";

export default class Pull extends oclif.Command {
    static description = "pull all (or some) Eta modules from remote";
    static flags = {
        "modules": oclif.flags.string({
            char: "m",
            description: "Module names to pull",
            required: false
        })
    };

    async run() {
        const { flags } = this.parse(Pull);
        const moduleNames = flags.modules
            ? flags.modules.split(",")
            : await fs.readdir(lib.WORKING_DIR + "/modules");
        this.log("Pulling " + moduleNames.join(", ") + "...");
        const changedModules: string[] = [];
        for (const moduleName of moduleNames) {
            if (!await fs.pathExists(moduleName)) {
                this.warn(`\tModule ${moduleName} does not exist.`);
                continue;
            }
            this.log(`\tPulling module ${moduleName}...`);
            const moduleDir = lib.WORKING_DIR + "/modules/" + moduleName;
            try {
                const result = await lib.exec("git pull", { cwd: moduleDir });
                if (result.stdout.replace(/\-/g, " ") === "Already up to date.\n") continue;
            } catch (err) {
                this.warn("Couldn't pull " + moduleName + ":");
                process.stderr.write(err.stderr);
                continue;
            }
            this.log(`\tModule ${moduleName} had updates.`);
            changedModules.push(moduleName);
            await lib.exec("npm i", { cwd: moduleDir });
        }
        if (changedModules.length > 0) {
            await oclif.run(["generate:indexes"]);
            await oclif.run(["compile:server", "--no-exit"]);
            await oclif.run(["compile:client", "-m", changedModules.join(",")]);
        }
    }
}
