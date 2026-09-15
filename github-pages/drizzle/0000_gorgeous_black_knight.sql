CREATE TABLE `content_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`version` integer NOT NULL,
	`content_json` text NOT NULL,
	`created_at` integer NOT NULL,
	`created_by` text NOT NULL,
	`action` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `media_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`storage_key` text NOT NULL,
	`filename` text NOT NULL,
	`mime_type` text NOT NULL,
	`size` integer NOT NULL,
	`alt_text` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`created_by` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_assets_storage_key_idx` ON `media_assets` (`storage_key`);--> statement-breakpoint
CREATE TABLE `site_content` (
	`id` text PRIMARY KEY NOT NULL,
	`draft_json` text NOT NULL,
	`published_json` text NOT NULL,
	`draft_updated_at` integer NOT NULL,
	`published_at` integer NOT NULL,
	`updated_by` text NOT NULL,
	`version` integer DEFAULT 0 NOT NULL
);
