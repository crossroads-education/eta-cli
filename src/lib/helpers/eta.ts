import * as constants from "../constants";
import { exec } from "./promisified";
import * as fs from "fs-extra";
import * as orm from "typeorm";
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

    public static async connectORM(workingDir: string): Promise<orm.Connection> {
        require(workingDir + "/helpers/require.js");
        const options: orm.ConnectionOptions = await fs.readJSON(workingDir + "/config/global/db.json");
        return await orm.createConnection({
            ...options,
            entities: (await this.getModuleSubDirs(workingDir, [], "models")).map(d => d + "/*.js"),
            namingStrategy: new (require(workingDir + "/lib/DatabaseNamingStrategy.js").default)()
        });
    }

    public static get workingModuleName(): string {
        const tokens: string[] = process.cwd().replace(/\\/g, "/").split("/");
        return tokens.reverse()[tokens.reverse().findIndex(t => t === "modules") + 1];
    }

    public static async getModuleSubDirs(workingDir: string, moduleNames: string[], dirKey: string): Promise<string[]> {
        return (await this.getModuleConfigs(workingDir, moduleNames)).map(moduleConfig => {
            return (<string[]>moduleConfig.dirs[dirKey]).map(dir => {
                return `${workingDir}/modules/${moduleConfig.name}/${dir}`;
            }).filter(d => d !== undefined);
        }).reduce((p, v) => p.concat(v));
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

    public static async lint(dir: string, shouldFix: boolean, workingDir = dir) {
        let command = `node ${constants.TSLINT_PATH} -c ${workingDir}/tslint.json -p tsconfig.json`;
        if (shouldFix) command += " --fix";
        try {
            await exec(command, { cwd: dir });
        } catch (err) {
            process.stderr.write(err.stdout);
        }
    }

    public static async getModuleConfigs(workingDir: string, moduleNames: string[]): Promise<any[]> {
        if (moduleNames.length === 0) moduleNames = await fs.readdir(workingDir + "/modules");
        return (await Promise.all(moduleNames.map(moduleName => {
            const moduleDir = workingDir + "/modules/" + moduleName;
            return fs.readJSON(moduleDir + "/eta.json");
        })));
    }
}
