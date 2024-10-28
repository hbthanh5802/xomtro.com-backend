ALTER TABLE `addresses` MODIFY COLUMN `province_name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `addresses` MODIFY COLUMN `district_name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `addresses` MODIFY COLUMN `ward_name` varchar(255) NOT NULL;