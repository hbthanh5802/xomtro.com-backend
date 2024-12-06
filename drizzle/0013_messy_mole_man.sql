ALTER TABLE `chat_members` DROP FOREIGN KEY `chat_members_chat_id_chats_id_fk`;
--> statement-breakpoint
ALTER TABLE `chat_members` DROP FOREIGN KEY `chat_members_user_id_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `messages` DROP FOREIGN KEY `messages_asset_id_assets_id_fk`;
--> statement-breakpoint
ALTER TABLE `messages` ADD `chatId` int;--> statement-breakpoint
ALTER TABLE `chat_members` ADD CONSTRAINT `chat_members_chat_id_chats_id_fk` FOREIGN KEY (`chat_id`) REFERENCES `chats`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `chat_members` ADD CONSTRAINT `chat_members_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_chatId_chats_id_fk` FOREIGN KEY (`chatId`) REFERENCES `chats`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_asset_id_assets_id_fk` FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `idx_messages_chat_id_sent_at` ON `messages` (`chatId`,`sent_at`);