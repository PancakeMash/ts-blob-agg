import { readConfig } from "./config.js";
import {
    type CommandsRegistry, handlerLogin,
    registerCommand,
    runCommand
} from "./commands.js";



function main() {
    const cfg = readConfig();
    const registry: CommandsRegistry = {};

    registerCommand(registry, "login", handlerLogin);

    const args: string[] = process.argv.slice(2);
    const cmdName = args[0];
    const cmdArgs = args.slice(1);

    if (args.length < 1) {
        console.log("not enough arguments provided - gator <command> <args>");
        process.exit(1);
    }

    runCommand(registry, cmdName, ...cmdArgs);
}

main();