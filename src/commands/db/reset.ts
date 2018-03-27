import * as lib from "../../lib";
import * as oclif from "@oclif/command";

export default class DBReset extends oclif.Command {
    static examples = [];
    static flags = {
        "no-wait": oclif.flags.boolean({
            char: "n",
            description: "Don't wait 3 seconds before resetting"
        })
    };
    static args = [];

    async run() {
        const { flags } = this.parse(DBReset);
        if (!flags["no-wait"]) {
            this.log("You have 3 seconds to cancel... (CTRL-C)");
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        const db = await lib.eta.connectDatabase(lib.WORKING_DIR);
        let result = await db.query(`select tablename from pg_tables where schemaname = 'public'`);
        await db.query(result.rows.map(r => `drop table if exists "${r.tablename}" cascade`).join("; "));
        result = await db.query(`select relname from pg_class where relkind = 'S'`);
        await db.query(result.rows.map(r => `drop sequence if exists "${r.relname}"`).join("; "));
        await db.end();
        this.log("Successfully reset database.");
    }
}
