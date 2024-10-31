ALTER TABLE `users_detail` MODIFY COLUMN `email` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users_detail` ADD CONSTRAINT `users_detail_email_unique` UNIQUE(`email`);