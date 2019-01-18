import * as fs from "fs-extra";
import * as lib from "../lib";
import * as oclif from "@oclif/command";
import * as Octokit from "@octokit/rest";
import * as urllib from "url";

export default class Install extends oclif.Command {
    static description = "install an Eta module";
    static args = [{
        name: "url",
        description: "url to install module from",
        required: true
    }];
    private octokit: Octokit | undefined;

    async run() {
        const { args } = this.parse(Install);
        await this.loadOctokit();
        await this.install(args.url, false);
        // do all this after all modules have been installed
        await oclif.run(["generate:indexes"]);
        await oclif.run(["compile:server", "--no-exit"]);
        await oclif.run(["compile:client", "--no-exit"]);
    }

    /**
     * Returns false if the module has already been installed.
     */
    private async install(url: string, isDependency = true): Promise<boolean> {
        const isHTTPS = url.startsWith("https://");
        let branch = url.split("#")[1];
        url = url.split("#")[0];
        if (url.startsWith("git@")) {
            url = url.split(":").slice(1).join(":");
        } else if (url.startsWith("https://")) {
            url = urllib.parse(url).path!.substring(1);
        }
        const [owner, repo] = url.split("/");
        let metadata: {
            name: string;
            dependencies: string[];
            dirs: {
                staticFiles: string[];
            }
        } = await this.fetchMetadata(owner, repo, branch);
        const moduleDir = lib.WORKING_DIR + "/modules/" + metadata.name;
        if (await fs.pathExists(moduleDir)) {
            return false;
        }
        // check branch name after exists check
        if (branch === undefined) {
            if (isDependency) {
                branch = await lib.question("What branch would you like to install " + url + " as? ");
                metadata = await this.fetchMetadata(owner, repo, branch); // refetch metadata for potentially different dependencies
            } else {
                branch = "master";
            }
        }
        if ((metadata.dependencies || []).length > 0) {
            for (const url of metadata.dependencies) {
                this.log(`Installing dependency ${url}...`);
                try {
                    if (await this.install(url)) {
                        this.log(`Successfully installed dependency ${url}`);
                    } else {
                        this.log(`Skipping dependency ${url}: already installed`);
                    }
                } catch (err) {
                    this.error(`Couldn't install dependency ${url}: ${err.message}`);
                }
            }
        }
        try {
            const gitUrl = (isHTTPS ? "https://github.com/" : "git@github.com:") + url;
            await lib.exec(`git clone ${gitUrl} ${moduleDir}`, { cwd: lib.WORKING_DIR });
            await lib.exec(`git checkout ${branch}`, { cwd: moduleDir });
        } catch (err) {
            this.error(err.stdout + "\n" + err.stderr);
        }
        // fire hook preinstall
        this.log("\tInstalling NPM modules...");
        await lib.exec("yarn install", { cwd: moduleDir });
        const jsDirs = metadata.dirs.staticFiles.map(d => moduleDir + "/" + d + "/js");
        if (jsDirs.length > 0) this.log(`\tInstalling client-side NPM modules...`);
        for (const jsDir of jsDirs) {
            if (!await fs.pathExists(jsDir)) continue;
            await lib.exec("yarn install", { cwd: jsDir });
        }
        return true;
    }

    private async fetchMetadata(owner: string, repo: string, branch = "master") {
        try {
            const res = await this.octokit!.repos.getContents({
                owner, repo,
                path: "eta.json",
                ref: branch
            });
            return JSON.parse(res.data);
        } catch (err) {
            if (err.code === 404) {
                this.error(`Module ${owner}/${repo}#${branch} does not exist, or the repository does not contain eta.json.`);
                process.exit(1);
            }
            throw err;
        }
    }

    private async loadOctokit() {
        const configFilename = lib.HOME_DIR + "/.etaconfig";
        let token: string;
        try {
            token = (await fs.readJSON(configFilename)).githubToken;
        } catch {
            this.log("Your Github personal access token can be created with this guide: https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/");
            token = await lib.question("Enter your Github personal access token: ");
            await fs.writeJSON(configFilename, { githubToken: token });
        }
        this.octokit = new Octokit({ headers: { accept: "application/vnd.github.VERSION.raw" } });
        this.octokit!.authenticate({
            type: "token", token
        });
    }
}
