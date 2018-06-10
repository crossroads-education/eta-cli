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
            const moduleDir = lib.WORKING_DIR + "/modules/" + moduleName;
            if (!await fs.pathExists(moduleDir)) {
                this.warn(`\tModule ${moduleName} does not exist.`);
                continue;
            }
            this.log(`\tPulling module ${moduleName}...`);
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
        }
        if (changedModules.length === 0) return;
        await oclif.run(["generate:indexes"]);
        await Promise.all(changedModules.map(async moduleName => {
            this.log("Updating NPM modules for " + moduleName + "...");
            await lib.exec("yarn install", { cwd: lib.WORKING_DIR + "/modules/" + moduleName });
            const jsDir = lib.WORKING_DIR + "/modules/" + moduleName + "/static/js";
            if (await fs.pathExists(jsDir)) {
                await lib.exec("yarn install", { cwd: jsDir });
            }
        }));
        await oclif.run(["compile:server", "--no-exit"]);
        await oclif.run(["compile:client", "-m", changedModules.join(",")]);
    }
}
