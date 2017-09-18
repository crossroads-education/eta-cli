import * as fs from "fs-extra";
import * as lib from "../..";

async function lint(moduleName: string): Promise<boolean> {
    // TODO Implement
    return true;
}

export default async function execute(moduleNames: string[]): Promise<boolean> {
    console.log("Compiling client-side JS...");
    return lib.forEachClientJS(moduleNames, lint);
}
