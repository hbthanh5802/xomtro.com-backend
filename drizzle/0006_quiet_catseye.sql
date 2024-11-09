ALTER TABLE `pass_post_items` RENAME COLUMN `name` TO `pass_item_name`;--> statement-breakpoint
ALTER TABLE `posts` MODIFY COLUMN `status` enum('actived','unactived') DEFAULT 'actived';--> statement-breakpoint
ALTER TABLE `pass_post_items` ADD `pass_item_name_slug` varchar(255);--> statement-breakpoint
ALTER TABLE `posts` ADD `title_slug` varchar(255);