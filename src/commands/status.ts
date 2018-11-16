import * as fs from "fs-extra";
import * as lib from "../lib";
import * as oclif from "@oclif/command";

export default class Status extends oclif.Command {
    static description = "list all modules and branch names";

    async run() {
        const moduleNames = ["eta"].concat(await fs.readdir(lib.WORKING_DIR + "/modules"));

        for (const moduleName of moduleNames) {
            const moduleDir = lib.WORKING_DIR + (moduleName === "eta" ? "" : "/modules/" + moduleName);
            const cwd = moduleDir;
            if (!await fs.pathExists(moduleDir)) {
                this.warn(`\tModule ${moduleName} does not exist.`);
                continue;
            }
            const needsCommit = !!(await lib.exec("git diff-index --quiet HEAD || echo 'untracked'", { cwd })).stdout;
            const remoteStat = await this.compareToRemote(cwd);
            const branch = (await lib.exec("git symbolic-ref --short HEAD", { cwd })).stdout;
            const repoUrl = (await lib.exec("git config --get remote.origin.url", { cwd })).stdout;
            const match = repoUrl && repoUrl.match(/.*\/(.*)/);
            const shortUrl = (match ? match[1] : repoUrl);
            const stats = [];
            if (needsCommit) stats.push("needs commit");
            if (remoteStat) stats.push(remoteStat);
            this.log(moduleName + ": " + shortUrl + "#" + branch.trim() + " [" + stats.join(",") + "]");
        }
    }

    async compareToRemote(cwd: string) {
        const local = (await lib.exec("git rev-parse @", { cwd })).stdout;
        const remote = (await lib.exec("git rev-parse @{push}", { cwd })).stdout;
        const base = (await lib.exec("git merge-base @ @{push}", { cwd })).stdout;
        if (local === remote) return "up-to-date";
        else if (local === base) return "needs pull";
        else if (remote === base) return "needs push";
        else return "diverged";
    }
}
