ALTER TABLE `assets` ADD `created_at` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `assets` ADD `updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;