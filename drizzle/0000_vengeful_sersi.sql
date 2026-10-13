CREATE TABLE `email_challenges` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`email` text NOT NULL,
	`purpose` text NOT NULL,
	`code_hash` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`proof_hash` text,
	`verified_at` integer,
	`proof_expires_at` integer,
	`consumed_at` integer
);
--> statement-breakpoint
CREATE INDEX `email_challenges_user_created_idx` ON `email_challenges` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `merchant_stores` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`email` text NOT NULL,
	`owner_name` text NOT NULL,
	`business_name` text NOT NULL,
	`slug` text NOT NULL,
	`logo_key` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `merchant_stores_user_id_unique` ON `merchant_stores` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `merchant_stores_slug_unique` ON `merchant_stores` (`slug`);