import { table } from "console";
import { pgTable, timestamp, uuid, text, unique } from "drizzle-orm/pg-core";
import { getUserById } from "./queries/users";

export const users = pgTable("users",
    {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    name: text("name").notNull().unique(),
    }
);

export type User = typeof users.$inferSelect;

export const feeds = pgTable("feeds",
    {
        id: uuid("id").primaryKey().defaultRandom().notNull(),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
        name: text("name").notNull(),
        url: text("url").notNull().unique(),
        userId: uuid("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    }
);

export type Feed = typeof feeds.$inferSelect; // feeds is the table object in schema.ts

export const feed_follows = pgTable("feed_follows", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
        userId: uuid("user_id")
        .references(() => users.id, {onDelete: "cascade"})
        .notNull(),
        feedId: uuid("feed_id")
        .references(() => feeds.id, {onDelete: "cascade"})
        .notNull(),
},
(table) => [
  unique("feed_follows_user_id_feed_id_unique").on(table.userId, table.feedId),
]
);