import * as fs from "fs-extra";
import * as lib from "../lib";
import * as oclif from "@oclif/command";

/*
Config file structure:
{
    "name": "ivytech",
    "github": "crossroads-education/eta#master",
    "modules": [
        { name: "cre-auth", github: "crossroads-education/eta-auth#master" },
        { name: "cre-db-external", github: "crossroads-education/eta-db-external#dev-ivytech-import" },
        { name: "cre-db-shared", github: "crossroads-education/eta-db-shared#dev-ivytech-data-import" },
        { name: "cre-web-element", github: "crossroads-education/eta-web-element#master" },
        { name: "cre-web-shared", github: "crossroads-education/eta-web-sharedh#master" }
    ]
}
*/

export default class Init extends oclif.Command {
    static description = "init an Eta eta project";
    static args = [{
        name: "target",
        description: "target directory; if not provided will use the 'name' property in the config file",
        required: false
    }];
    static flags = {
        "config": oclif.flags.string({
            description: "config file",
            required: true
        }),
        "host": oclif.flags.string({
            description: "add config folder for this host (e.g. localhost)",
            required: false
        })
    };

    async run() {
        const { flags, args } = this.parse(Init);
        await this.runInit(args.target, flags.config, flags.host);
        // // do all this after all modules have been installed
        // await oclif.run(["generate:indexes"]);
        // await oclif.run(["compile:server", "--no-exit"]);
        // await oclif.run(["compile:client", "--no-exit"]);
    }

    /**
     * Returns false if the module has already been installed.
     */
    private async runInit(targetDir: string, configFile: string, host?: string): Promise<boolean> {
        // read config
        let config;
        try {
            config = fs.readJSONSync(configFile);
        } catch (err) {
            this.error(`Error reading json file ${configFile}: ${err}.`);
        }

        // create path
        const path = targetDir || config.name;
        if (fs.existsSync(path)) this.error(`Target directory ${path} already exists.`);
        this.log(`Initializing into ${path}.`);

        // clone eta
        await this.install(config.github, path);

        // clone modules
        const modules: { name: string, github: string}[] = config.modules;
        if (modules) {
            for (const {name, github} of modules) {
                await this.install(github, path + "/modules/" + name);
            }
        }

        // host config folder
        if (host) {
            fs.mkdirSync(`${path}/config/${host}`);
            this.log(`Created ${host} folder in ${path}/config.`);
        }

        this.log(`\nSuccess! You can now setup the config files in ${path}/config and run "eta start" inside ${path}.`);
        return true;
    }

    async install(github: string, path: string): Promise<boolean> {
        const branch = github.split("#")[1] || "master";
        const url = github.split("#")[0];
        if (await fs.pathExists(path)) return false;

        // check branch name after exists check
        try {
            const gitUrl = `git@github.com:${url}`;
            this.log(`Cloning repository ${github} into ${path}.`);
            await lib.exec(`git clone ${gitUrl} ${path}`, { cwd: lib.WORKING_DIR });
            if (branch !== "master") {
                await lib.exec(`git checkout ${branch}`, { cwd: path });
            }
        } catch (err) {
            this.error(err.stdout + "\n" + err.stderr);
        }
        // install npm modules
        this.log("\tInstalling NPM modules...");
        await lib.exec("npm install", { cwd: path });
        const metadata = this.loadEtaConfig(path);
        if (metadata && metadata.dirs && metadata.dirs.staticFiles) {
            const jsDirs = metadata.dirs.staticFiles.map((d: string) => path + "/" + d + "/js");
            if (jsDirs.length > 0) this.log(`\tInstalling client-side NPM modules...`);
            for (const jsDir of jsDirs) {
                if (!await fs.pathExists(jsDir)) continue;
                await lib.exec("npm install", { cwd: jsDir });
            }
        }
        return true;
    }

    loadEtaConfig(path: string) {
        try {
            return fs.readJSONSync(path + "/eta.json");
        } catch (err) {
            return false;
        }
    }
}
