import * as fs from "fs-extra";
import * as _ from "lodash";
import * as path from "path";
import { recursiveReaddir } from "./promisified";

const GENERATED_WARNING = "// Automatically generated by Eta CLI. Do not commit this file!";

interface IndexConfig {
    filename: string;
    type: "index" | "export";
    dirs: string[];
    prepend: string[] | undefined; // lines to prepend to output
    exclude: string[] | undefined; // item names to exclude
    only: string[] | undefined; // item names to only include
}

class IndexedItem {
    baseName = "";
    absoluteFilename = "";
    relativeFilename = "";
    sortFirst = false;
    body = "";
    parent: string | undefined;
    isModel = false; // should it be included in RepositoryManager

    constructor(init: Partial<IndexedItem>) {
        Object.assign(this, init);
    }

    getExportSnippet(): string[] {
        let lines: string[] = this.body.split("\n")
            .map(line => line.replace(/ default /g, " ").replace(/\r/g, ""))
            .filter(line => {
                line = line.trim(); // don't want to return trimmed lines
                return !(
                    line.startsWith("@") ||
                    line.startsWith("import ") ||
                    line.length === 0 ||
                    (line.startsWith("export ") && line.endsWith(";"))
                );
            });
        // support for old stop-generate (and new generate:stop)
        const stopIndex = lines.map(line => line.trim()).findIndex(line =>
            line === "// generate:stop" || line === "// stop-generate");
        if (stopIndex !== -1) {
            lines = lines.splice(0, stopIndex);
            lines.push("}");
        }
        return lines;
    }

    getIndexSnippet(): string {
        return `export {default as ${this.baseName}} from "./${this.relativeFilename.replace(/\.ts/g, "")}";`;
    }

    getModelSnippet(): string {
        const importPath = this.relativeFilename.replace(/\.ts/g, "");
        return `import ${this.baseName} from "./${importPath}";
export {default as ${this.baseName}} from "./${importPath}";`;
    }
}

export default class HelperIndexes {
    private moduleNames: string[] = [];
    private etaDir: string;
    constructor(workingDir: string) {
        this.etaDir = workingDir;
    }

    async generate(): Promise<void> {
        const rootIndexConfigs: IndexConfig[] = await fs.readJSON(this.etaDir + "/indexes.json");
        try {
            this.moduleNames = await fs.readdir(this.etaDir + "/modules");
        } catch { /* we don't care about this, modules doesn't exist */ }
        await Promise.all(this.moduleNames.map(async moduleName => {
            const moduleDir = this.etaDir + "/modules/" + moduleName;
            const indexConfigs: IndexConfig[] = (await fs.readJSON(moduleDir + "/eta.json")).indexes || [];
            await Promise.all(indexConfigs.map(cfg => this.generateFromConfig(moduleDir, cfg)));
        }).concat(rootIndexConfigs.map(cfg => this.generateFromConfig(this.etaDir, cfg))).concat([this.generateModels()]));
    }

    /**
     * Entries from /indexes.json and eta.json
     */
    private async generateFromConfig(workingDir: string, config: IndexConfig): Promise<void> {
        config.exclude = config.exclude || [];
        // collect items
        const items = (await this.getItems(config.dirs.map(d => workingDir + "/" + d))).filter(i =>
            !config.exclude!.includes(i.baseName) &&
            (!config.only || config.only.includes(i.baseName)));
        // sort items by their parents (unparented first)
        const sortItem = (index: number) => {
            const parentIndex = items.findIndex(i => i.baseName === items[index].parent);
            if (parentIndex > index) {
                // swap
                const temp = items[index];
                items[index] = items[parentIndex];
                items[parentIndex] = temp;
                sortItem(parentIndex);
            }
        };
        for (let i = 0; i < items.length; i++) {
            if (items[i].parent) sortItem(i);
        }
        let lines: string[] = [];
        for (const item of items) {
            const snippet = config.type === "export" ? item.getExportSnippet() : [item.getIndexSnippet()];
            lines = item.sortFirst ? snippet.concat(lines) : lines.concat(snippet);
        }
        // do this last so any sortFirst items don't overwrite prepends
        if (config.prepend) lines = config.prepend.concat(lines);
        lines.splice(0, 0, GENERATED_WARNING);
        await fs.writeFile(workingDir + "/" + config.filename, lines.join("\n") + "\n");
    }

    private async generateModels(): Promise<void> {
        const modelDirs: string[] = (await Promise.all(this.moduleNames.map(async moduleName => {
            const config = await fs.readJSON(this.etaDir + "/modules/" + moduleName + "/eta.json");
            return (<string[]>config.dirs.models || []).map(d => this.etaDir + "/modules/" + moduleName + "/" + d);
        }))).reduce((p, v) => p.concat(v), []);
        const items = (await this.getItems(modelDirs, this.etaDir)).sort((a, b) => a.absoluteFilename.localeCompare(b.absoluteFilename));
        const serverLines: string[] = [
            GENERATED_WARNING,
            `import * as orm from "typeorm";`
        ];
        let clientLines: string[] = [];
        for (const item of items) {
            item.isModel = !(item.body.includes("// generate:ignore-file") || /export (default )?(enum|interface) /g.test(item.body));
            serverLines.push(item.isModel ? item.getModelSnippet() : item.getIndexSnippet());
            const exportSnippet = item.getExportSnippet();
            clientLines = item.sortFirst ? exportSnippet.concat(clientLines) : clientLines.concat(exportSnippet);
        }
        serverLines.push(`export class RepositoryManager {
    private name: string;
    constructor(name: string) {
        this.name = name;
    }
    public get connection(): orm.Connection {
        return orm.getConnection(this.name);
    }
${items.filter(i => i.isModel).map(item => `    public get ${_.camelCase(item.baseName)}(): orm.Repository<${item.baseName}> {
        return this.connection.getRepository(${item.baseName});
    }`).join("\n")}
}
export default RepositoryManager;`);
        clientLines.splice(0, 0, GENERATED_WARNING);
        const clientBody = clientLines.join("\n") + "\n";
        await Promise.all(this.moduleNames.map(async moduleName => {
            const jsDir = `${this.etaDir}/modules/${moduleName}/static/js`;
            if (!await fs.pathExists(jsDir)) return;
            await fs.writeFile(jsDir + "/db.ts", clientBody);
        }).concat([fs.writeFile(this.etaDir + "/db.ts", serverLines.join("\n") + "\n")]));
    }

    private async getItems(dirs: string[], baseDir?: string): Promise<IndexedItem[]> {
        const isRecursive = !baseDir;
        return (await Promise.all(dirs.map(async d => {
            const items = await Promise.all((await (isRecursive ? recursiveReaddir(d) : fs.readdir(d)))
                .filter(f => f.endsWith(".ts"))
                .map(f => this.getItem(isRecursive ? f : d + "/" + f))
            );
            items.forEach(i => i.relativeFilename = path.relative(baseDir || d, i.absoluteFilename).replace(/\\/g, "/"));
            return items.filter(i => i.baseName !== "index");
        }))).reduce((p, v) => p.concat(v), []);
    }

    private async getItem(filename: string): Promise<IndexedItem> {
        filename = filename.replace(/\\/g, "/");
        const body = await fs.readFile(filename, "utf-8");
        const extendMatches = body.match(/(class|interface) [A-z\_]+ extends ([A-z\.\_]+)/);
        let parentName: string | undefined = undefined;
        if (extendMatches) {
            parentName = extendMatches[2].split(".").slice(-1)[0];
        }
        return new IndexedItem({
            baseName: path.basename(filename, ".ts"),
            absoluteFilename: filename,
            relativeFilename: "",
            sortFirst: body.includes("// generate:sort-first"),
            parent: parentName,
            body, isModel: false
        });
    }
}
