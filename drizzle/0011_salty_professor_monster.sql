CREATE TABLE `user_following` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`following_user_id` int,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_following_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_posts_interested` (
	`id` int AUTO_INCREMENT NOT NULL,
	`post_id` int,
	`user_id` int,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_posts_interested_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `join_posts` MODIFY COLUMN `move_in_date` datetime NOT NULL;--> statement-breakpoint
ALTER TABLE `wanted_posts` MODIFY COLUMN `move_in_date` datetime NOT NULL;--> statement-breakpoint
ALTER TABLE `user_following` ADD CONSTRAINT `user_following_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_following` ADD CONSTRAINT `user_following_following_user_id_users_id_fk` FOREIGN KEY (`following_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_posts_interested` ADD CONSTRAINT `user_posts_interested_post_id_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_posts_interested` ADD CONSTRAINT `user_posts_interested_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;