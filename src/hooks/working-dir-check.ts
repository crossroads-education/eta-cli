import * as fs from "fs-extra";
import * as oclif from "@oclif/config";
import * as lib from "../lib";

const hook: oclif.Hook<"init"> = async function(options) {
    if (options && ["readme", "-v"].includes(options.id!)) return;
    const tokens = lib.WORKING_DIR.split("/");
    let isValid = false;
    let i = tokens.length;
    for (; i > 0; i--) {
        const workingDir = tokens.slice(0, i).join("/");
        try {
            if ((await fs.readJSON(workingDir + "/package.json")).name === "@xroadsed/eta") {
                isValid = true;
                break;
            }
        } catch { }
    }
    if (!isValid) {
        return this.error("Please run the Eta CLI tool in the directory of an Eta v2.6+ instance.");
    }
    const newWorkingDir = tokens.slice(0, i).join("/");
    (<any>lib).IN_ETA_ROOT = newWorkingDir === lib.WORKING_DIR;
    (<any>lib).WORKING_DIR = newWorkingDir;
};

export default hook;
