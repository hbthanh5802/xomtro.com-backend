ALTER TABLE `post_comments` RENAME COLUMN `ownerId` TO `owner_id`;--> statement-breakpoint
ALTER TABLE `post_comments` DROP FOREIGN KEY `post_comments_ownerId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `post_comments` ADD CONSTRAINT `post_comments_owner_id_users_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;