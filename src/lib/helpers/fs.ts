import * as fs from "fs-extra";

export default class HelperFS {
    public static async transformJsonFile<Original, Final>(filename: string, transformer: (original: Original) => Final): Promise<Final> {
        const original: Original = await fs.pathExists(filename) ? await fs.readJSON(filename) : {};
        const final: Final = transformer(original);
        await fs.writeFile(filename, JSON.stringify(final, undefined, 2));
        return final;
    }

    public static async getNearestFile(tokens: string[], transform: (filename: string) => string = s => s): Promise<string | undefined> {
        let i: number;
        let path = undefined;
        for (i = tokens.length; i > 0; i--) {
            path = tokens.slice(0, i).join("/");
            if (await fs.pathExists(transform(path))) break;
            else path = undefined;
        }
        if (path !== undefined) tokens.splice(0, i);
        return path;
    }
}
