ALTER TABLE `posts` DROP FOREIGN KEY `posts_address_id_addresses_id_fk`;
--> statement-breakpoint
ALTER TABLE `posts` ADD `address_province` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `address_district` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `address_detail` varchar(255);--> statement-breakpoint
ALTER TABLE `posts` ADD `address_ward` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `address_longitude` decimal(11,8);--> statement-breakpoint
ALTER TABLE `posts` ADD `address_latitude` decimal(10,8);--> statement-breakpoint
ALTER TABLE `posts` DROP COLUMN `address_id`;