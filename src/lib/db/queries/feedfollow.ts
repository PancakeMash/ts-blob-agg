import { db } from "..";
import { eq, and } from "drizzle-orm";
import { feeds, users, feed_follows } from "../schema";

export async function createFeedFollow(userId: string, feedId: string) {
    const [newFeedFollow] = await db.insert(feed_follows).values({userId: userId, feedId: feedId}).returning();
    
    const [result] = await db
    .select({
        id: feed_follows.id,
        feedName: feeds.name,
        user: users.name,
        feedId: feed_follows.feedId,
        userId: feed_follows.userId,
        createdAt: feed_follows.createdAt,
        updatedAt: feed_follows.updatedAt,
    })
    .from(feed_follows)
    .innerJoin(feeds, eq(feeds.id, feed_follows.feedId))
    .innerJoin(users, eq(users.id, feed_follows.userId))
    .where(eq(feed_follows.id, newFeedFollow.id));

    return result;
}

export async function getFeedFollowsForUser(userId: string) {
  const result = await db
    .select({
      id: feed_follows.id,
      createdAt: feed_follows.createdAt,
      updatedAt: feed_follows.updatedAt,
      userId: feed_follows.userId,
      feedId: feed_follows.feedId,
      feedName: feeds.name,
      feedUrl: feeds.url,
    })
    .from(feed_follows)
    .innerJoin(feeds, eq(feed_follows.feedId, feeds.id))
    .where(eq(feed_follows.userId, userId));

  return result;
}

export async function unfollowFeed(userId: string, feedId: string) {
 await db.delete(feed_follows).where(and(eq(feed_follows.feedId, feedId), eq(feed_follows.userId, userId)));
}