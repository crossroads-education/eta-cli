import * as lib from "../..";

export default async function execute(args: string[]): Promise<boolean> {
    const db = await lib.connectDB();
    if (!args.includes("--no-wait")) {
        console.log("You have 3 seconds to cancel.");
        await new Promise(resolve => {
            setTimeout(resolve, 3000);
        });
    }
    console.warn("WARNING: Resetting database!");
    await db.connect();
    let result = await db.query(`select tablename from pg_tables where schemaname = 'public'`);
    await db.query(result.rows.map(r => `drop table if exists "${r.tablename}" cascade`).join("; "));
    result = await db.query(`select relname from pg_class where relkind = 'S'`);
    await db.query(result.rows.map(r => `drop sequence if exists "${r.relname}"`).join("; "));
    await db.end();
    return true;
}
