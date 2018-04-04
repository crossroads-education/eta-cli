import * as childProcess from "child_process";
import * as readline from "readline";
import * as recursiveReaddirCallback from "recursive-readdir";
import * as util from "util";

export const exec = util.promisify(childProcess.exec);
export const recursiveReaddir: (path: string) => Promise<string[]> = <any>util.promisify(recursiveReaddirCallback);

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
