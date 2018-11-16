import * as fs from "fs-extra";
import * as lib from "../lib";
import * as oclif from "@oclif/command";

export default class ExtractConfig extends oclif.Command {
    static description = "create a config file for 'eta init' based on the current eta setup";

    async run() {
        const moduleNames = ["eta"].concat(await fs.readdir(lib.WORKING_DIR + "/modules"));
        const name = (await lib.exec("basename `pwd`")).stdout.trim();
        const config: any = { name };
        for (const moduleName of moduleNames) {
            const moduleDir = lib.WORKING_DIR + (moduleName === "eta" ? "" : "/modules/" + moduleName);
            const cwd = moduleDir;
            if (!await fs.pathExists(moduleDir)) {
                this.warn(`\tModule ${moduleName} does not exist.`);
                continue;
            }

            const branch = (await lib.exec("git symbolic-ref --short HEAD", { cwd })).stdout.trim();
            const repoUrl = (await lib.exec("git config --get remote.origin.url", { cwd })).stdout.trim();
            const match = repoUrl && repoUrl.match(/git@github\.com:(.*)/);
            const shortUrl = (match ? match[1] : repoUrl);

            if (moduleName === "eta") {
                config.github = `${shortUrl}#${branch}`;
            } else {
                if (!config.modules) config.modules = [];
                config.modules.push({
                    name: moduleName,
                    github: `${shortUrl}#${branch}`
                });
            }
        }
        this.log(JSON.stringify(config, undefined, 4));
    }
}
