CREATE TABLE `bottles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`wine_id` integer NOT NULL,
	`storage_location` text,
	`purchase_date` text,
	`purchase_price` real,
	`purchase_currency` text DEFAULT 'USD',
	`purchase_source` text,
	`status` text DEFAULT 'in_stock' NOT NULL,
	`consumed_date` text,
	`added_by` integer NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`wine_id`) REFERENCES `wines`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`added_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_bottles_wine_id` ON `bottles` (`wine_id`);--> statement-breakpoint
CREATE INDEX `idx_bottles_status` ON `bottles` (`status`);--> statement-breakpoint
CREATE INDEX `idx_bottles_storage` ON `bottles` (`storage_location`);--> statement-breakpoint
CREATE TABLE `refresh_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`token_hash` text NOT NULL,
	`family_id` text NOT NULL,
	`revoked` integer DEFAULT false NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_refresh_tokens_user` ON `refresh_tokens` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_refresh_tokens_family` ON `refresh_tokens` (`family_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_refresh_tokens_hash` ON `refresh_tokens` (`token_hash`);--> statement-breakpoint
CREATE TABLE `storage_locations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`parent_id` integer,
	`description` text,
	`capacity` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`parent_id`) REFERENCES `storage_locations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tasting_notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bottle_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`tasted_date` text NOT NULL,
	`rating` integer,
	`appearance` text,
	`nose` text,
	`palate` text,
	`finish` text,
	`overall_notes` text,
	`occasion` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`bottle_id`) REFERENCES `bottles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_tasting_notes_bottle` ON `tasting_notes` (`bottle_id`);--> statement-breakpoint
CREATE INDEX `idx_tasting_notes_user` ON `tasting_notes` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_tasting_notes_rating` ON `tasting_notes` (`rating`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`display_name` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `wines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`producer` text NOT NULL,
	`region` text NOT NULL,
	`sub_region` text,
	`country` text NOT NULL,
	`vintage` integer,
	`varietal` text NOT NULL,
	`color` text NOT NULL,
	`bottle_size` text DEFAULT '750ml' NOT NULL,
	`alcohol_pct` real,
	`drink_from` integer,
	`drink_to` integer,
	`notes` text,
	`created_by` integer NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_wines_producer` ON `wines` (`producer`);--> statement-breakpoint
CREATE INDEX `idx_wines_region` ON `wines` (`region`);--> statement-breakpoint
CREATE INDEX `idx_wines_country` ON `wines` (`country`);--> statement-breakpoint
CREATE INDEX `idx_wines_vintage` ON `wines` (`vintage`);--> statement-breakpoint
CREATE INDEX `idx_wines_color` ON `wines` (`color`);