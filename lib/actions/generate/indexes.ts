import * as fs from "fs-extra";
import * as lib from "../..";
import * as path from "path";

interface ScriptItem {
    name: string;
    absoluteFilename: string;
    relativeFilename: string;
    sortFirst: boolean;
    extends: string;
}

function getModelSnippet(item: ScriptItem): string {
    return `import ${item.name} from "./${item.relativeFilename}";
export {default as ${item.name}} from "./${item.relativeFilename}";
export function ${item.name[0].toUpperCase() + item.name.substr(1)}(): orm.Repository<${item.name}> { return orm.getRepository(${item.name}); }`;
}

function getIndexSnippet(item: ScriptItem): string {
    return `export {default as ${item.name}} from "./${item.relativeFilename}";`;
}

function getExportSnippet(item: ScriptItem): string[] {
    let lines: string[] = (fs.readFileSync(item.absoluteFilename.replace(/\.js/g, ".ts"), "utf-8")).split("\n")
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

async function getScriptItems(dirs: string[], fileEnding: string, baseDir: string = lib.WORKING_DIR): Promise<ScriptItem[]> {
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
                name: path.basename(f, fileEnding),
                relativeFilename: path.relative(baseDir, f).replace(/\\/g, "/"),
                absoluteFilename: f,
                sortFirst: body.includes("// generate:sort-first"),
                extends: extendsName
            };
        }).filter(f =>
            f.name !== "index" &&
            f.absoluteFilename.endsWith(fileEnding) &&
            !(fileEnding === ".js" && !fs.pathExistsSync(f.absoluteFilename.replace(/\.js/g, ".ts")))
        ));
    }
    return items;
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
    const fileEnding: string = config.type === "export" ? ".ts" : ".js";
    processItemExtends((await Promise.all((<string[]>config.dirs).map(d => {
        const moduleDir: string = modulePath + "/" + d;
        return getScriptItems([moduleDir], fileEnding, moduleDir);
    }))).reduce((prev, next) =>
            prev.concat(next)
        ).filter(i =>
            !config.exclude.includes(i.name)
        )).forEach(item => {
            if (config.exclude.includes(item.name)) return;
            // console.log(item.name);
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
    const items: ScriptItem[] = (await getScriptItems(modelDirs, ".js"))
        .sort((a, b) => a.absoluteFilename.localeCompare(b.absoluteFilename));
    const dbLines: string[] = [
        "// Automatically generated by Eta v2's /scripts/generate.ts",
        "import * as orm from \"typeorm\";",
        "import * as eta from \"./eta\";"
    ];
    let exportLines: string[] = [];
    for (const item of items) {
        const code: string = await fs.readFile(item.absoluteFilename.replace(/\.js/g, ".ts"), "utf-8");
        if (code.includes("// generate:ignore-file")) {
            dbLines.push(getIndexSnippet(item));
        } else {
            dbLines.push(getModelSnippet(item));
        }
        const exportSnippet: string[] = getExportSnippet(item);
        if (code.includes("// generate:sort-first")) {
            exportLines = exportSnippet.concat(exportLines);
        } else {
            exportLines = exportLines.concat(exportSnippet);
        }
    }
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
    }
    return true;
}
