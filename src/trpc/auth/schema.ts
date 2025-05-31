import { users } from "@/trpc/users/schema";
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  uniqueIndex,
  primaryKey,
  integer,
} from "drizzle-orm/pg-core";

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (accounts) => [
    // ✅ pass actual column references here, not strings
    uniqueIndex("provider_providerAccountId_idx").on(
      accounts.provider,
      accounts.providerAccountId
    ),
  ]
);

export const sessions = pgTable(
  "sessions",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .primaryKey()
      .notNull(),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (sessions) => [uniqueIndex("session_token_unique").on(sessions.sessionToken)]
);

export const verificationTokens = pgTable(
  "verificationTokens",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationTokens) => [
    primaryKey({
      columns: [verificationTokens.identifier, verificationTokens.token],
    }),
  ]
);
