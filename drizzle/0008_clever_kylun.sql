ALTER TABLE `join_posts` MODIFY COLUMN `price_unit` enum('vnd','usd') DEFAULT 'vnd';--> statement-breakpoint
ALTER TABLE `pass_posts` MODIFY COLUMN `price_unit` enum('vnd','usd') DEFAULT 'vnd';--> statement-breakpoint
ALTER TABLE `rental_posts` MODIFY COLUMN `price_unit` enum('vnd','usd') DEFAULT 'vnd';--> statement-breakpoint
ALTER TABLE `wanted_posts` MODIFY COLUMN `price_unit` enum('vnd','usd') DEFAULT 'vnd';