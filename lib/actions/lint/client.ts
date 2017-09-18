import * as fs from "fs-extra";
import * as lib from "../..";
import { lint } from "./server";

export default function execute(moduleNames: string[]): Promise<boolean> {
    let shouldFix = false;
    if (moduleNames.includes("fix")) {
        moduleNames.splice(moduleNames.indexOf("fix"), 1);
        shouldFix = true;
    }
    console.log("Linting client-side JS...");
    return lib.forEachClientJS(moduleNames, lint(shouldFix));
}
