import * as childProcess from "child_process";
import * as util from "util";

export const exec = util.promisify(childProcess.exec);
