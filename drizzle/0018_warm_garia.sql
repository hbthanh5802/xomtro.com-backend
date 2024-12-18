ALTER TABLE `post_comments` ADD `ownerId` int;--> statement-breakpoint
ALTER TABLE `post_comments` ADD `parent_comment_id` int;--> statement-breakpoint
ALTER TABLE `post_comments` ADD CONSTRAINT `post_comments_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `post_comments` ADD CONSTRAINT `post_comments_parent_comment_id_users_id_fk` FOREIGN KEY (`parent_comment_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;