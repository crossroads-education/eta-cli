import * as lib from "..";
import compileServer from "./compile/server";

export default function execute(args: string[]): Promise<boolean> {
    console.log("Compiling server since no option was specified (client or server)...");
    return compileServer(args);
}
