import * as fs from "fs-extra";
import * as lib from "../..";
import * as path from "path";
import * as _ from "lodash";

interface ScriptItem {
    name: string;
    absoluteFilename: string;
    relativeFilename: string;
    sortFirst: boolean;
    extends: string;
}

function getModelSnippet(item: ScriptItem): string {
    const importPath: string = item.relativeFilename.replace(/\.ts/g, "");
    return `import ${item.name} from "./${importPath}";
export {default as ${item.name}} from "./${importPath}";`;
}

function getIndexSnippet(item: ScriptItem): string {
    return `export {default as ${item.name}} from "./${item.relativeFilename.replace(/\.ts/g, "")}";`;
}

function getExportSnippet(item: ScriptItem): string[] {
    let lines: string[] = (fs.readFileSync(item.absoluteFilename, "utf-8")).split("\n")
        .map(l => l.replace(/ default /g, " ").replace(/\r/g, ""))
        .filter(l => {
            l = l.trim();
            return !l.startsWith("@") &&
                !l.startsWith("import ") &&
                l.length > 0 &&
                !(l.startsWith("export ") && l.endsWith(";"));
        });
    const stopIndex: number = lines.map(l => l.trim()).indexOf("// stop-generate");
    if (stopIndex !== -1) {
        lines = lines.splice(0, stopIndex);
        lines.push("}");
    }
    return lines;
}

async function getScriptItems(dirs: string[], baseDir: string = lib.WORKING_DIR): Promise<ScriptItem[]> {
    let items: ScriptItem[] = [];
    for (const dir of dirs) {
        items = items.concat((await lib.recursiveReaddir(dir)).map(f => {
            f = f.replace(/\\/g, "/");
            const body = fs.readFileSync(f, "utf-8");
            const match = body.match(/(class|interface) [A-z\_]+ extends ([A-z\.\_]+)/);
            let extendsName = undefined;
            if (match) {
                const extendTokens: string[] = match ? match[2].split(".") : [undefined];
                extendsName = extendTokens[extendTokens.length - 1].replace(/\_js/g, "");
                extendsName = extendsName.endsWith("_") ? extendsName.substr(0, extendsName.length - 1) : extendsName;
            }
            return <ScriptItem>{
                name: path.basename(f, ".ts"),
                relativeFilename: path.relative(baseDir, f).replace(/\\/g, "/"),
                absoluteFilename: f,
                sortFirst: body.includes("// generate:sort-first"),
                extends: extendsName
            };
        }).filter(f =>
            f.name !== "index" &&
            f.absoluteFilename.endsWith(".ts")
        ));
    }
    return _.uniqBy(items, i => i.absoluteFilename);
}

function processItemExtends(items: ScriptItem[]): ScriptItem[] {
    const processItem = (i: number) => {
        const otherIndex = items.findIndex(item => item.name === items[i].extends);
        if (otherIndex > i) {
            const temp = Object.assign({}, items[i]);
            items[i] = items[otherIndex];
            items[otherIndex] = temp;
            processItem(i);
        }
    };
    for (let i = 0; i < items.length; i++) {
        if (items[i].extends) {
            processItem(i);
        }
    }
    return items;
}

async function generateFiles(config: any, modulePath: string): Promise<void> {
    let lines: string[] = [];
    const basePath: string = path.dirname(modulePath + "/" + config.filename);
    if (!config.exclude) config.exclude = [];
    processItemExtends((await Promise.all((<string[]>config.dirs).map(d => {
        const moduleDir: string = modulePath + "/" + d;
        return getScriptItems([moduleDir], moduleDir);
    }))).reduce((prev, next) =>
            prev.concat(next)
        ).filter(i =>
            !config.exclude.includes(i.name)
        )).forEach(item => {
            if (config.exclude.includes(item.name)) return;
            if (config.only && !config.only.includes(item.name)) return;
            const snippet = config.type === "export" ? getExportSnippet(item) : [getIndexSnippet(item)];
            lines = item.sortFirst ? snippet.concat(lines) : lines.concat(snippet);
        });
    if (config.prepend) {
        lines = config.prepend.concat(lines);
    }
    lines.splice(0, 0, "// Automatically generated by Eta v2's /scripts/generate.ts");
    await fs.writeFile(modulePath + "/" + config.filename, lines.join("\r\n") + "\r\n");
}

async function generateModels(): Promise<void> {
    const moduleNames: string[] = await fs.readdir(lib.WORKING_DIR + "/modules");
    const modelDirs: string[] = moduleNames.map(moduleName => {
        const moduleConfig: any = JSON.parse(fs.readFileSync(lib.WORKING_DIR + "/modules/" + moduleName + "/eta.json", "utf-8"));
        return (<string[]>moduleConfig.dirs.models)
            .map(d => lib.WORKING_DIR + "/modules/" + moduleName + "/" + d);
    }).reduce((prev, next) => prev.concat(next));
    const items: ScriptItem[] = (await getScriptItems(modelDirs))
        .sort((a, b) => a.absoluteFilename.localeCompare(b.absoluteFilename));
    const dbLines: string[] = [
        "// Automatically generated by Eta v2's /scripts/generate.ts",
        "import * as orm from \"typeorm\";",
        "import * as eta from \"./eta\";"
    ];
    let exportLines: string[] = [];
    const repositoryItems: ScriptItem[] = [];
    for (const item of items) {
        const code: string = await fs.readFile(item.absoluteFilename, "utf-8");
        if (code.includes("// generate:ignore-file") || code.includes("export enum ") || code.includes("export interface ") || code.includes("export default interface ")) {
            dbLines.push(getIndexSnippet(item));
        } else {
            dbLines.push(getModelSnippet(item));
            repositoryItems.push(item);
        }
        const exportSnippet: string[] = getExportSnippet(item);
        if (code.includes("// generate:sort-first")) {
            exportLines = exportSnippet.concat(exportLines);
        } else {
            exportLines = exportLines.concat(exportSnippet);
        }
    }
    dbLines.push(`export class RepositoryManager {
    private name: string;
    public constructor(name: string) {
        this.name = name;
    }
    public get connection(): orm.Connection {
        return orm.getConnection(this.name);
    }`);
    for (const item of repositoryItems) {
        dbLines.push(`    public get ${_.camelCase(item.name)}(): orm.Repository<${item.name}> {
        return orm.getConnection(this.name).getRepository(${item.name});
    }`);
    }
    dbLines.push("}\nexport default RepositoryManager;");
    exportLines.splice(0, 0, "// Automatically generated by Eta v2's /scripts/generate.ts");
    const promises: Promise<void>[] = [
        fs.writeFile(lib.WORKING_DIR + "/db.ts", dbLines.join("\r\n") + "\r\n")
    ];
    const exportBody: string = exportLines.join("\r\n") + "\r\n";
    moduleNames.forEach(moduleName => {
        const jsDir: string = lib.WORKING_DIR + "/modules/" + moduleName + "/static/js";
        if (fs.existsSync(jsDir)) {
            promises.push(fs.writeFile(jsDir + "/db.ts", exportBody));
        }
    });
    await Promise.all(promises);
}

async function handleIndexConfig(filename: string, useKey = true): Promise<void> {
    if (!await fs.pathExists(filename)) {
        return;
    }
    let configs: any = JSON.parse(await fs.readFile(filename, "utf-8"));
    if (useKey) {
        configs = configs["indexes"] ? configs["indexes"] : [];
    }
    await Promise.all((<any[]>configs).map((config: any) => generateFiles(config, path.dirname(filename))));
}

function writeModuleExports(moduleDir: string): Promise<void[]> {
    return Promise.all([
        fs.writeFile(moduleDir + "/eta.ts", `export * from "../../eta";`),
        fs.writeFile(moduleDir + "/db.ts", `export * from "../../db";`)
    ]);
}

export default async function execute(args: string[]): Promise<boolean> {
    console.log("Generating indexes and exports...");
    await handleIndexConfig(lib.WORKING_DIR + "/indexes.json", false);
    if (await fs.pathExists(lib.WORKING_DIR + "/modules")) {
        const promises: Promise<any>[] = [generateModels()];
        const moduleNames: string[] = await fs.readdir(lib.WORKING_DIR + "/modules");
        for (const moduleName of moduleNames) {
            const moduleDir: string = lib.WORKING_DIR + "/modules/" + moduleName;
            promises.push(handleIndexConfig(moduleDir + "/eta.json"));
            promises.push(writeModuleExports(moduleDir));
        }
        await Promise.all(promises);
    } else {
        await fs.writeFile(lib.WORKING_DIR + "/db.ts", `import * as orm from "typeorm";
export class RepositoryManager {
    private name: string;
    public constructor(name: string) {
        this.name = name;
    }
    public get connection(): orm.Connection {
        return orm.getConnection(this.name);
    }
}
export default RepositoryManager;`);
    }
    return true;
}
