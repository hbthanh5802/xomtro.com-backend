CREATE TABLE `user_contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`contact_type` enum('facebook','email','phone','zalo','other') DEFAULT 'other',
	`pass_item_name` varchar(255) NOT NULL,
	`is_actived` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_followers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`following_user_id` int,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_followers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP TABLE `user_following`;--> statement-breakpoint
DROP TABLE `user_post_reactions`;--> statement-breakpoint
ALTER TABLE `addresses` DROP FOREIGN KEY `addresses_user_id_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_user_id_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_post_id_posts_id_fk`;
--> statement-breakpoint
ALTER TABLE `user_posts_interested` DROP FOREIGN KEY `user_posts_interested_post_id_posts_id_fk`;
--> statement-breakpoint
ALTER TABLE `user_posts_interested` DROP FOREIGN KEY `user_posts_interested_user_id_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `user_contacts` ADD CONSTRAINT `user_contacts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `user_followers` ADD CONSTRAINT `user_followers_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `user_followers` ADD CONSTRAINT `user_followers_following_user_id_users_id_fk` FOREIGN KEY (`following_user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_post_id_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `user_posts_interested` ADD CONSTRAINT `user_posts_interested_post_id_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `user_posts_interested` ADD CONSTRAINT `user_posts_interested_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;