import * as childProcess from "child_process";
import * as readline from "readline";
import * as util from "util";

export const exec = util.promisify(childProcess.exec);

export function question(query: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(resolve => {
        rl.question(query, answer => {
            rl.close();
            resolve(answer);
        });
    });
}
