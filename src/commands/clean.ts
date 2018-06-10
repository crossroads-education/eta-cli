import * as fs from "fs-extra";
import * as lib from "../lib";
import * as oclif from "@oclif/command";

export default class Clean extends oclif.Command {
    static description = "clean all JS files without matching TS files";

    async run() {
        const files = (await lib.recursiveReaddir(lib.WORKING_DIR))
            .map(f => f.replace(/\\/g, "/"))
            .filter(f => !f.includes("/node_modules/") && !f.includes("/build/"));
        const unmatchedFiles = files.filter(f => f.endsWith(".js") && !files.includes(f.replace(/\.js/g, ".ts")));
        await Promise.all(unmatchedFiles.map(f => fs.unlink(f)));
        this.log(`Deleted ${unmatchedFiles.length} unmatched files.`);
    }
}
