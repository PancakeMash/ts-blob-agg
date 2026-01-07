import { db } from "..";
import { eq, sql } from "drizzle-orm";
import { feeds, users } from "../schema";
import { fetchFeed } from "src/rss";

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

export async function markFeedFetched(feedId: string) {
    await db.update(feeds)
            .set({lastFetchedAt: new Date(), updatedAt: new Date()})
            .where(eq(feeds.id, feedId));

}

export async function getNextFeedToFetch() {
    const [result] = await db.select().from(feeds).orderBy(sql`last_fetched_at ASC NULLS FIRST`).limit(1);

    return result;
}

export async function scrapeFeeds() {
    const nextFeed = await getNextFeedToFetch();
    if (!nextFeed) {
        throw new Error("could not get next feed");
    }
    await markFeedFetched(nextFeed.id);

    const fetchedFeed = await fetchFeed(nextFeed.url);
    if (!fetchedFeed) {
        throw new Error("unable to fetch feed");
    }

    for (const feed of fetchedFeed.channel.item) {
        console.log(feed.title);
    }

}