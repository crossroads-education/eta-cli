import * as fs from "fs-extra";
import * as path from "path";
import * as pg from "pg";
import HelperFS from "./fs";

export default class HelperEta {
    public static async connectDatabase(workingDir: string): Promise<pg.Client> {
        const options: pg.ConnectionConfig & { username: string; } = await fs.readJSON(workingDir + "/config/global/db.json");
        options.user = options.username;
        const client = new pg.Client(options);
        await client.connect();
        return client;
    }

    public static get workingModuleName(): string {
        const tokens: string[] = process.cwd().replace(/\\/g, "/").split("/");
        return tokens.reverse()[tokens.reverse().findIndex(t => t === "modules") + 1];
    }

    public static async getClientJSDirs(workingDir: string, moduleNames: string[]): Promise<string[]> {
        if (moduleNames.length === 0) moduleNames = await fs.readdir(workingDir + "/modules");
        return (await Promise.all(moduleNames.map(async moduleName => {
            const moduleDir = workingDir + "/modules/" + moduleName;
            const moduleConfig = await fs.readJSON(moduleDir + "/eta.json");
            return <string[]>(await Promise.all((<string[]>moduleConfig.dirs.staticFiles).map(async staticDir => {
                const jsDir = `${moduleDir}/${staticDir}/js`;
                return (await fs.pathExists(jsDir + "/tsconfig.json")) ? jsDir : undefined;
            }))).filter(d => d !== undefined);
        }))).reduce((p, v) => p.concat(v));
    }

    public static async generateAsset(moduleDir: string, type: string, filename: string, body: string) {
        if (!await fs.pathExists(moduleDir + "/eta.json")) {
            throw new Error(`The "eta.json" file is missing in ${moduleDir}.`);
        }
        const dirs: string[] = (await HelperFS.transformJsonFile<any, any>(moduleDir + "/eta.json", config => {
            config.dirs[type] = config.dirs[type] || [type];
            if (config.dirs[type].length === 0) config.dirs[type].push(type);
            return config;
        })).dirs[type];
        const outputFilename = `${moduleDir}/${dirs[0]}/${filename}.ts`;
        await fs.mkdirp(path.dirname(outputFilename));
        await fs.writeFile(outputFilename, body);
    }
}
