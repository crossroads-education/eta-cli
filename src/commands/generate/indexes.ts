import * as lib from "../../lib";
import * as oclif from "@oclif/command";

export default class GenerateIndexes extends oclif.Command {
    static description = "generate index files";
    static aliases = ["generate"];
    async run() {
        const generator = new lib.IndexGenerator(lib.WORKING_DIR);
        await generator.generate();
        this.log("Generated indexes.");
    }
}
