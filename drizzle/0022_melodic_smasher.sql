ALTER TABLE `notifications` ADD `created_at` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `notifications` ADD `updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;