import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const siteContent = sqliteTable("site_content", {
  id: text("id").primaryKey(),
  draftJson: text("draft_json").notNull(),
  publishedJson: text("published_json").notNull(),
  draftUpdatedAt: integer("draft_updated_at").notNull(),
  publishedAt: integer("published_at").notNull(),
  updatedBy: text("updated_by").notNull(),
  version: integer("version").notNull().default(0),
});

export const contentRevisions = sqliteTable("content_revisions", {
  id: text("id").primaryKey(),
  version: integer("version").notNull(),
  contentJson: text("content_json").notNull(),
  createdAt: integer("created_at").notNull(),
  createdBy: text("created_by").notNull(),
  action: text("action").notNull(),
});

export const mediaAssets = sqliteTable(
  "media_assets",
  {
    id: text("id").primaryKey(),
    storageKey: text("storage_key").notNull(),
    filename: text("filename").notNull(),
    mimeType: text("mime_type").notNull(),
    size: integer("size").notNull(),
    altText: text("alt_text").notNull().default(""),
    createdAt: integer("created_at").notNull(),
    createdBy: text("created_by").notNull(),
  },
  (table) => [uniqueIndex("media_assets_storage_key_idx").on(table.storageKey)],
);

export const adminCredentials = sqliteTable("admin_credentials", {
  id: text("id").primaryKey(),
  username: text("username").notNull(),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const adminSessions = sqliteTable("admin_sessions", {
  id: text("id").primaryKey(),
  username: text("username").notNull(),
  createdAt: integer("created_at").notNull(),
  expiresAt: integer("expires_at").notNull(),
});

export const adminLoginAttempts = sqliteTable("admin_login_attempts", {
  id: text("id").primaryKey(),
  failures: integer("failures").notNull(),
  windowStartedAt: integer("window_started_at").notNull(),
  blockedUntil: integer("blocked_until").notNull(),
});
