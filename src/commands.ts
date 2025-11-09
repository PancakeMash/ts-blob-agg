import {setUser} from "./config.js";


export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler): void {
    registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]): Promise<void> {
    const handler = registry[cmdName];
    if (handler === undefined) {
        throw new Error(`unknown command: ${cmdName}`);
    }
    await handler(cmdName, ...args);
}


//Handler functions:
export async function handlerLogin(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length !== 1) {
        throw new Error("login requires exactly one username");
    }
    const username = args[0];
    setUser(username);

    console.log("logged in as", username);
}


//Types:
type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>;


