ALTER TABLE `assets` ADD `name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `assets` ADD `format` varchar(25);--> statement-breakpoint
ALTER TABLE `assets` ADD `tags` json;