import { check } from "drizzle-orm/gel-core/checks.js";
import {setUser} from "./config.js";
import { createUser, getUser, deleteUsers, getUsers } from "./lib/db/queries/users.js"
import { db } from "./lib/db/index.js";
import { readConfig } from "./config.js";
import { fetchFeed } from "./rss.js";


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
    const checking = await getUser(username);
    if (!checking) {
        throw new Error("user does not exist");
    }
    setUser(username);
    console.log("logged in as", username);
}

export async function handlerRegister(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length !==1) {
        throw new Error("Registration requires exactly one username");
    }
    const username = args[0];
    const checkName = await getUser(username);
    if (checkName) {
        throw new Error("user already exists");
    }

    const newUser = await createUser(username);
    setUser(username);
    console.log("User has been created: ", newUser);
}

export async function handlerReset(cmdName: string, ...args: string[]): Promise<void> {
    await deleteUsers();
    console.log("database reset successfully");
}

export async function handlerUsers(cmdName: string, ...args: string[]): Promise<void> {
    const users = await getUsers();
    const cfg = readConfig();
    const currUser = cfg.currentUserName;

    for (let i = 0; i < users.length; i++) {
        let listUser = users[i].name;
        if (listUser === currUser) {
            console.log(`* ${listUser} (current)`);
            continue;
        }
        console.log(`* ${listUser}`);
    }
}

export async function handlerAgg(cmdName: string, ...args: string[]): Promise<void> {
    const url = "https://www.wagslane.dev/index.xml";
    const feed = await fetchFeed(url);
    console.log(JSON.stringify(feed, null, 2));
}


//Types:
type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>;


