import { readConfig } from "./config.js";
import {
    type CommandsRegistry, handlerLogin,
    registerCommand,
    runCommand,
    handlerRegister
} from "./commands.js";



async function main() {
    const cfg = readConfig();
    const registry: CommandsRegistry = {};

    registerCommand(registry, "login", handlerLogin);
    registerCommand(registry, "register", handlerRegister);

    const args: string[] = process.argv.slice(2);
    const cmdName = args[0];
    const cmdArgs = args.slice(1);

    if (args.length < 1) {
        console.log("not enough arguments provided - gator <command> <args>");
        process.exit(1);
    }

    try {
        await runCommand(registry, cmdName, ...cmdArgs);
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(msg);
        process.exit(1);
    }
    process.exit(0);
}

await main();