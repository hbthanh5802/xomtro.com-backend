DROP TABLE `properties`;--> statement-breakpoint
ALTER TABLE `join_posts` RENAME COLUMN `totalAreaUnit` TO `total_area_unit`;--> statement-breakpoint
ALTER TABLE `messages` RENAME COLUMN `chatId` TO `chat_id`;--> statement-breakpoint
ALTER TABLE `rental_posts` RENAME COLUMN `totalAreaUnit` TO `total_area_unit`;--> statement-breakpoint
ALTER TABLE `user_contacts` RENAME COLUMN `pass_item_name` TO `contact_content`;--> statement-breakpoint
ALTER TABLE `wanted_posts` RENAME COLUMN `totalAreaUnit` TO `total_area_unit`;--> statement-breakpoint
ALTER TABLE `messages` DROP FOREIGN KEY `messages_chatId_chats_id_fk`;
--> statement-breakpoint
DROP INDEX `idx_messages_chat_id_sent_at` ON `messages`;--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `type` enum('chat','post','account','general') NOT NULL;--> statement-breakpoint
ALTER TABLE `users_detail` MODIFY COLUMN `phone` varchar(25);--> statement-breakpoint
ALTER TABLE `users_detail` MODIFY COLUMN `first_name` varchar(50);--> statement-breakpoint
ALTER TABLE `post_comments` ADD `tags` varchar(255);--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_chat_id_chats_id_fk` FOREIGN KEY (`chat_id`) REFERENCES `chats`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `idx_messages_chat_id_sent_at` ON `messages` (`chat_id`,`sent_at`);