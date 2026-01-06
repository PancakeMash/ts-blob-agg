import { db } from "..";
import { eq } from "drizzle-orm";
import { feeds, users } from "../schema";

export async function createFeed(name: string, url: string, userId: string) {
    const [result] = await db.insert(feeds).values({name: name, url: url, userId: userId}).returning();
    return result;
}

export async function getFeedByUrl(url: string) {
    const [result] = await db.select().from(feeds).where(eq(feeds.url, url));
    return result;
}

export async function getFeeds() {
    const result = await db.select({name: feeds.name, url: feeds.url, username: users.name}).from(feeds).innerJoin(users, eq(feeds.userId, users.id));
    return result;
}