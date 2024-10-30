CREATE TABLE `post_assets` (
	`post_id` int NOT NULL,
	`asset_id` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pk_post_id_asset_id` PRIMARY KEY(`post_id`,`asset_id`)
);
--> statement-breakpoint
ALTER TABLE `users_detail` MODIFY COLUMN `role` enum('renter','landlord');--> statement-breakpoint
ALTER TABLE `assets` ADD `user_id` int;--> statement-breakpoint
ALTER TABLE `assets` ADD `post_id` int;--> statement-breakpoint
ALTER TABLE `post_assets` ADD CONSTRAINT `post_assets_post_id_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `post_assets` ADD CONSTRAINT `post_assets_asset_id_assets_id_fk` FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `assets` ADD CONSTRAINT `assets_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `assets` ADD CONSTRAINT `assets_post_id_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE cascade ON UPDATE cascade;