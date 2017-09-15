import * as fs from "fs-extra";
import * as lib from "..";

import compileClient from "./compile/client";
import compileServer from "./compile/server";
import generateIndexes from "./generate/indexes";

class ModuleInstaller {
    private url: string;
    private name: string;
    private path: string;
    private config: lib.ModuleConfiguration;

    public constructor(url: string) {
        this.url = url;
        this.name = this.url.split("/").slice(-1)[0].replace(/\.git/g, "");
        this.path = lib.WORKING_DIR + "/modules/" + this.name;
    }

    public async install(isDependency = true): Promise<boolean> {
        try {
            await lib.exec(`git clone ${this.url} ${this.path}`, { cwd: lib.WORKING_DIR });
        } catch (err) {
            if (!isDependency) {
                console.error("Couldn't clone the repository. Please check that the Git URL exists and that your SSH key is valid.");
            }
            return false;
        }
        this.config = JSON.parse(await fs.readFile(this.path + "/eta.json", "utf-8"));
        if (this.config.dependencies) {
            for (const url of this.config.dependencies) {
                // dependency installation
                if (url.split("/").length !== 2) {
                    console.error("Please format dependency URLs as: username/repository (only Github repositories)");
                    console.error("Couldn't get dependency: " + url);
                    continue;
                }
                console.log("Installing dependency... (" + url + ")");
                const installer: ModuleInstaller = new ModuleInstaller("git@github.com:" + url);
                try {
                    if (await installer.install()) {
                        console.log("Successfully installed dependency: " + url);
                    } else {
                        console.log("Skipping dependency " + url + ": Already installed.");
                    }
                } catch (err) {
                    console.error("Couldn't install dependency: " + url, err);
                }
            }
        }
        await this.fireHook("preinstall");
        if (this.config.name !== this.name) {
            this.name = this.config.name;
            await fs.move(this.path, lib.WORKING_DIR + "/modules/" + this.name);
            this.path = lib.WORKING_DIR + "/modules/" + this.name;
        }
        console.log("\tInstalling NPM modules...");
        await lib.exec("npm i --only=dev", { cwd: this.path });
        await lib.exec("npm i --only=prod", { cwd: this.path });
        console.log("\tSetting up client-side JS...");
        for (const staticPath of this.config.dirs.staticFiles) {
            const jsPath = `${this.path}/${staticPath}/js`;
            if (!(await fs.pathExists(jsPath))) {
                continue;
            }
            if (await fs.pathExists(jsPath + "/typings.json")) {
                await lib.exec("node " + lib.CLI_DIR + "node_modules/typings/dist/bin.js i", { cwd: jsPath });
            }
        }
        if (!await generateIndexes([])) return false;
        console.log("\tCompiling server-side JS...");
        if (!await compileServer([])) return false;
        console.log("\tCompiling client-side JS...");
        if (!await compileClient([])) return false;
        return true;
    }

    private async fireHook(name: string): Promise<void> {
        if (!this.config.hooks || !this.config.hooks[name]) {
            return;
        }
        for (const hook of this.config.hooks[name]) {
            const options: any = {};
            if (hook.cwd) {
                options.cwd = this.path + "/" + hook.cwd;
            }
            await lib.exec(hook.exec, options);
        }
    }
}

export default function execute(args: string[]): Promise<boolean> {
    let url: string = args[0];
    if (!url) {
        console.log("Usage: eta install <module-url>");
    }
    if (!url.startsWith("git@") && !url.startsWith("https://")) {
        url = "git@github.com:" + url;
    }
    const installer: ModuleInstaller = new ModuleInstaller(url);
    return installer.install(false);
}
