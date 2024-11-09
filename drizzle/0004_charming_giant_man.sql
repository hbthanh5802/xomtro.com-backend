ALTER TABLE `pass_post_items` DROP FOREIGN KEY `pass_post_items_pass_post_id_pass_posts_post_id_fk`;
--> statement-breakpoint
ALTER TABLE `pass_post_items` ADD `name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `pass_post_items` ADD CONSTRAINT `pass_post_items_pass_post_id_posts_id_fk` FOREIGN KEY (`pass_post_id`) REFERENCES `posts`(`id`) ON DELETE cascade ON UPDATE cascade;