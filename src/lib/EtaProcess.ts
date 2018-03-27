import * as childProcess from "child_process";

/**
 * Handles inter-process communication, instantiation, etc for Eta instances started by CLI.
 * Won't function without cre-web-shared installed
 */
export class EtaProcess {
    public process: childProcess.ChildProcess | undefined;
    public shouldLogAll: boolean;
    public workingDir: string;

    public constructor(workingDir: string, shouldLogAll: boolean) {
        this.workingDir = workingDir;
        this.shouldLogAll = shouldLogAll;
    }

    public async waitForIPC(filter: (msg: string) => boolean = () => true): Promise<string> {
        let msg: string | undefined;
        do {
            msg = await (new Promise<string | undefined>(resolve => {
                this.process!.once("message", msg => {
                    resolve(filter(msg) ? msg : undefined);
                });
            }));
        } while (msg === undefined);
        return msg!;
    }

    public async start(): Promise<void> {
        this.process = childProcess.spawn("node", [`${this.workingDir}/server.js`], {
            stdio: ["pipe", "pipe", "pipe", "ipc"], // IPC is inter-process communication
            cwd: this.workingDir
        });
        this.process.stdout.on("data", data => {
            if (this.shouldLogAll) process.stdout.write(data.toString());
        });
        this.process.stderr.on("data", data => {
            process.stderr.write(data.toString());
        });
        await this.waitForIPC(msg => msg === "eta:started");
    }
}
