CREATE INDEX `idx_assets_post_id` ON `assets` (`post_id`);--> statement-breakpoint
CREATE INDEX `idx_assets_user_id_post_id` ON `assets` (`user_id`,`post_id`);