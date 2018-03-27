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
}
