import * as oclif from "@oclif/command";

export default class Hello extends oclif.Command {
    static description = "describe the command here";

    static examples = [
        `$ eta hello
        hello world from ./src/hello.ts!
        `,
        `$ eta hello --name myname
        hello myname from .src/hello.ts!
        `,
    ];

    static flags = {
        // flag with a value (-n, --name=VALUE)
        name: oclif.flags.string({
            char: "n",
            description: "name to print"
        }),
        force: oclif.flags.boolean({
            char: "f"
        }),
    };

    static args = [
        {
            name: "file"
        }
    ];

    public async run(): Promise<void> {
        const {args, flags} = this.parse(Hello);

        const name = flags.name || "world";
        this.log(`hello ${name} from ${__filename}!`);
        if (args.file && flags.force) {
            this.log(`you input --force and --file: ${args.file}`);
        }
    }
}
