ALTER TABLE `messages` DROP FOREIGN KEY `messages_asset_id_assets_id_fk`;
--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_asset_id_assets_id_fk` FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON DELETE set null ON UPDATE cascade;