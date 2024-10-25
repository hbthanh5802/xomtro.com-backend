ALTER TABLE `users_detail` ADD `email` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users_detail` ADD `phone` varchar(25) NOT NULL;--> statement-breakpoint
ALTER TABLE `users_detail` ADD `gender` enum('male','female','others');--> statement-breakpoint
ALTER TABLE `users_detail` ADD `dob` date;--> statement-breakpoint
ALTER TABLE `users_detail` ADD `is_email_verified` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users_detail` ADD `is_phone_verified` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users_detail` ADD `avatar_asset_id` int;--> statement-breakpoint
ALTER TABLE `users_detail` ADD `created_at` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `users_detail` ADD `updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `users_detail` ADD CONSTRAINT `users_detail_avatar_asset_id_assets_id_fk` FOREIGN KEY (`avatar_asset_id`) REFERENCES `assets`(`id`) ON DELETE no action ON UPDATE no action;