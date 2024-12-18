ALTER TABLE `post_comments` DROP FOREIGN KEY `post_comments_parent_comment_id_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `post_comments` ADD CONSTRAINT `post_comments_parent_comment_id_post_comments_id_fk` FOREIGN KEY (`parent_comment_id`) REFERENCES `post_comments`(`id`) ON DELETE cascade ON UPDATE cascade;