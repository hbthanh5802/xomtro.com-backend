ALTER TABLE `properties` RENAME COLUMN `totalArea` TO `total_area`;--> statement-breakpoint
ALTER TABLE `join_posts` ADD `total_area` float;--> statement-breakpoint
ALTER TABLE `join_posts` ADD `totalAreaUnit` enum('cm2','m2','km2') DEFAULT 'm2';--> statement-breakpoint
ALTER TABLE `rental_posts` ADD `total_area` float;--> statement-breakpoint
ALTER TABLE `rental_posts` ADD `totalAreaUnit` enum('cm2','m2','km2') DEFAULT 'm2';--> statement-breakpoint
ALTER TABLE `wanted_posts` ADD `total_area` float;--> statement-breakpoint
ALTER TABLE `wanted_posts` ADD `totalAreaUnit` enum('cm2','m2','km2') DEFAULT 'm2';