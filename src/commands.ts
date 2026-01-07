import { setUser } from "./config.js";
import { createUser, getUser, deleteUsers, getUsers, getUserById } from "./lib/db/queries/users.js"
import { readConfig } from "./config.js";
import { fetchFeed } from "./rss.js";
import { createFeed, getFeeds, getFeedByUrl } from "./lib/db/queries/feeds.js";
import { createFeedFollow, getFeedFollowsForUser, unfollowFeed } from "./lib/db/queries/feedfollow.js";
import { type Feed, type User } from "./lib/db/schema.js";


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

export async function addFeed(cmdName: string, user: User, ...args: string[]): Promise<void>{
    if (args.length !== 2) {
        throw new Error(`usage: ${cmdName} <feed_name> <url>`);
    }
    const feedName = args[0];
    const feedUrl = args[1];

    const feed = await createFeed(feedName, feedUrl, user.id);
    if (!feed) {
        throw new Error("failed to create feed");
    }

    await createFeedFollow(user.id, feed.id);

    printFeed(feed, user);
}

export async function handlerGetFeeds(cmdName: string, ...args: string[]): Promise<void> {
    const feeds = await getFeeds();

    for (const feed of feeds) {
        console.log(feed.name);
        console.log(feed.url);
        console.log(feed.username);
    }
}

export async function handlerFollow(cmdName: string, user: User, ...args: string[]): Promise<void> {
     if (args.length !== 1) {
        throw new Error(`usage: ${cmdName} <url>`);
     }
     const url = args[0];
     const userId = user.id;

     const feedInfo = await getFeedByUrl(url);
     if (!feedInfo) {
        throw new Error(`feed not found for url: ${url}`);
     }
     const feedId = feedInfo.id;

     const feedFollow = await createFeedFollow(userId, feedId);
     console.log(`Feed: ${feedFollow.feedName}, User: ${feedFollow.user}`);
}

export async function handlerFollowing(cmdName: string, user: User, ...args: string[]): Promise<void> {
    const userId = user.id;

    const feedFollowings = await getFeedFollowsForUser(userId);
    for (const feedFollowing of feedFollowings) {
        console.log(feedFollowing.feedName);
    }

}

export async function handlerUnfollow(cmdName: string, user: User, ...args: string[]): Promise<void> {
    if (args.length !== 1) {
        throw new Error(`usage: ${cmdName} <url>`);
    }

    const feedFollowing = await getFeedFollowsForUser(user.id);
    if (!feedFollowing) {
        throw new Error("no feeds could be found for user");
    }

    const feedUrl = args[0];
    let feedId: string = "";
    for (const feed of feedFollowing) {
        if (feed.feedUrl === feedUrl) {
            feedId = feed.feedId;
        }
    }
    if (feedId === "") {
        throw new Error("feed could not be found for the provided url");
    }
    
    await unfollowFeed(user.id, feedId);
}

//Helper functions:
function printFeed(feed: Feed, user: User) {
    console.log(`* Feedname: ${feed.name}`);
    console.log(`* FeedUrl: ${feed.url}`);
    console.log(`* User ID: ${user.id}`);
    console.log(`* Username: ${user.name}`);
}

export function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {
    return async (cmdName: string, ...args: string[]): Promise<void> => {
        const cfg = readConfig();
        const currUser = cfg.currentUserName;
        if (!currUser) {
            throw new Error("user not found");
        }

        const userInfo = await getUser(currUser);
        if (!userInfo) {
            throw new Error("user not found");
        }

        await handler(cmdName, userInfo, ...args);
    };
}

//Types:
type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>;

type UserCommandHandler = (
    cmdName: string,
    user: User,
    ...args: string[]
) => Promise<void>;

type middlewareLoggedIn = (handler: UserCommandHandler) => CommandHandler;



