import * as fs from "fs-extra";
import * as pg from "pg";

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
}
