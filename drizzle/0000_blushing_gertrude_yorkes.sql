CREATE TABLE `addresses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`province_name` varchar(255) NOT NULL,
	`district_name` varchar(255) NOT NULL,
	`ward_name` varchar(255) NOT NULL,
	`detail` text,
	`postal_code` varchar(25),
	`latitude` decimal(11,8),
	`longitude` decimal(10,8),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `addresses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('image','video') NOT NULL,
	`url` text NOT NULL,
	`name` varchar(255) NOT NULL,
	`format` varchar(25),
	`tags` json,
	`folder` varchar(255),
	`user_id` int,
	`post_id` int,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chat_id` int,
	`user_id` int,
	`joined_at` timestamp NOT NULL DEFAULT (now()),
	`last_read_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chat_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_chat_members_chatId_userId` UNIQUE(`user_id`,`chat_id`)
);
--> statement-breakpoint
CREATE TABLE `chats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255),
	`type` enum('group','individual') NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `join_posts` (
	`post_id` int NOT NULL,
	`price_start` int NOT NULL,
	`price_end` int,
	`price_unit` enum('vnd','usd') NOT NULL,
	`move_in_date` date NOT NULL,
	CONSTRAINT `join_posts_post_id` PRIMARY KEY(`post_id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sender_id` int NOT NULL,
	`content` text NOT NULL,
	`asset_id` int,
	`message_type` enum('text','file') NOT NULL,
	`sent_at` datetime NOT NULL DEFAULT now(),
	`allow_recall_time` datetime NOT NULL,
	`is_recalled` boolean NOT NULL DEFAULT false,
	`recalled_at` timestamp,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('chat','post','account') NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text,
	`is_read` boolean DEFAULT false,
	`user_id` int NOT NULL,
	`post_id` int,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pass_post_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pass_post_id` int NOT NULL,
	`pass_price` int NOT NULL,
	`status` enum('new','used'),
	CONSTRAINT `pass_post_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pass_posts` (
	`post_id` int NOT NULL,
	`price_start` int NOT NULL,
	`price_end` int,
	`price_unit` enum('vnd','usd') NOT NULL,
	CONSTRAINT `pass_posts_post_id` PRIMARY KEY(`post_id`)
);
--> statement-breakpoint
CREATE TABLE `post_assets` (
	`post_id` int NOT NULL,
	`asset_id` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pk_post_id_asset_id` PRIMARY KEY(`post_id`,`asset_id`)
);
--> statement-breakpoint
CREATE TABLE `post_comment_closures` (
	`ancestor_id` int NOT NULL,
	`descendant_id` int NOT NULL,
	`depth` int NOT NULL,
	CONSTRAINT `pk_post_comment_closures` PRIMARY KEY(`ancestor_id`,`descendant_id`)
);
--> statement-breakpoint
CREATE TABLE `post_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`content` text NOT NULL,
	`post_id` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `post_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `post_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`label` varchar(25) NOT NULL,
	`used_count` int NOT NULL DEFAULT 1,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `post_tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`owner_id` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`expiration_after` int,
	`expiration_after_unit` enum('day','hour','minute') DEFAULT 'day',
	`status` enum('actived','unactived','removed') DEFAULT 'actived',
	`type` enum('rental','pass','join','wanted') NOT NULL,
	`note` text,
	`tagsList` json,
	`address_province` varchar(255) NOT NULL,
	`address_district` varchar(255) NOT NULL,
	`address_detail` varchar(255),
	`address_ward` varchar(255) NOT NULL,
	`address_longitude` decimal(11,8),
	`address_latitude` decimal(10,8),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`owner_id` int,
	`address_id` int,
	`totalArea` float,
	`totalAreaUnit` enum('cm2','m2','km2') DEFAULT 'm2',
	`price_range_start` int DEFAULT 0,
	`price_range_end` int,
	`is_actived` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `properties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rental_posts` (
	`post_id` int NOT NULL,
	`price_start` int NOT NULL,
	`price_end` int,
	`price_unit` enum('vnd','usd') NOT NULL,
	`min_lease_term` int NOT NULL,
	`min_lease_term_unit` enum('enum','day','month','year') NOT NULL,
	CONSTRAINT `rental_posts_post_id` PRIMARY KEY(`post_id`)
);
--> statement-breakpoint
CREATE TABLE `tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`value` varchar(255) NOT NULL,
	`type` enum('refresh','otp','text','verify') NOT NULL DEFAULT 'text',
	`is_actived` boolean DEFAULT true,
	`expiration_time` datetime NOT NULL,
	`user_id` int,
	`target` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_tokens_value` UNIQUE(`value`)
);
--> statement-breakpoint
CREATE TABLE `users_detail` (
	`user_id` int NOT NULL,
	`role` enum('renter','landlord'),
	`email` varchar(255) NOT NULL,
	`bio` text,
	`phone` varchar(25) NOT NULL,
	`first_name` varchar(50) NOT NULL,
	`last_name` varchar(50) NOT NULL,
	`gender` enum('male','female','others'),
	`dob` date,
	`is_email_verified` boolean DEFAULT false,
	`is_phone_verified` boolean DEFAULT false,
	`avatar_asset_id` int,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_detail_user_id` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `user_post_reactions` (
	`user_id` int NOT NULL,
	`post_id` int NOT NULL,
	`reaction_type` enum('like','heart','funny','angry','sad'),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pk_user_id_post_id` PRIMARY KEY(`user_id`,`post_id`),
	CONSTRAINT `idx_user_id_post_id` UNIQUE(`user_id`,`post_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`password` varchar(255) NOT NULL,
	`provider` enum('local','facebook','google') NOT NULL DEFAULT 'local',
	`status` enum('banned','actived','unactived') NOT NULL DEFAULT 'unactived',
	`facebook_id` varchar(255),
	`google_id` varchar(255),
	`token_version` int NOT NULL DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_facebook_id_unique` UNIQUE(`facebook_id`),
	CONSTRAINT `users_google_id_unique` UNIQUE(`google_id`)
);
--> statement-breakpoint
CREATE TABLE `wanted_posts` (
	`post_id` int NOT NULL,
	`price_start` int NOT NULL,
	`price_end` int,
	`price_unit` enum('vnd','usd') NOT NULL,
	`move_in_date` date NOT NULL,
	CONSTRAINT `wanted_posts_post_id` PRIMARY KEY(`post_id`)
);
--> statement-breakpoint
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assets` ADD CONSTRAINT `assets_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `assets` ADD CONSTRAINT `assets_post_id_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `chat_members` ADD CONSTRAINT `chat_members_chat_id_chats_id_fk` FOREIGN KEY (`chat_id`) REFERENCES `chats`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chat_members` ADD CONSTRAINT `chat_members_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `join_posts` ADD CONSTRAINT `join_posts_post_id_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_sender_id_users_id_fk` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_asset_id_assets_id_fk` FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_post_id_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pass_post_items` ADD CONSTRAINT `pass_post_items_pass_post_id_pass_posts_post_id_fk` FOREIGN KEY (`pass_post_id`) REFERENCES `pass_posts`(`post_id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `pass_posts` ADD CONSTRAINT `pass_posts_post_id_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `post_assets` ADD CONSTRAINT `post_assets_post_id_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `post_assets` ADD CONSTRAINT `post_assets_asset_id_assets_id_fk` FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `post_comment_closures` ADD CONSTRAINT `post_comment_closures_ancestor_id_post_comments_id_fk` FOREIGN KEY (`ancestor_id`) REFERENCES `post_comments`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `post_comment_closures` ADD CONSTRAINT `post_comment_closures_descendant_id_post_comments_id_fk` FOREIGN KEY (`descendant_id`) REFERENCES `post_comments`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `post_comments` ADD CONSTRAINT `post_comments_post_id_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `posts` ADD CONSTRAINT `posts_owner_id_users_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `properties` ADD CONSTRAINT `properties_owner_id_users_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `properties` ADD CONSTRAINT `properties_address_id_addresses_id_fk` FOREIGN KEY (`address_id`) REFERENCES `addresses`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `rental_posts` ADD CONSTRAINT `rental_posts_post_id_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `tokens` ADD CONSTRAINT `tokens_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `users_detail` ADD CONSTRAINT `users_detail_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `users_detail` ADD CONSTRAINT `users_detail_avatar_asset_id_assets_id_fk` FOREIGN KEY (`avatar_asset_id`) REFERENCES `assets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_post_reactions` ADD CONSTRAINT `user_post_reactions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `user_post_reactions` ADD CONSTRAINT `user_post_reactions_post_id_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `wanted_posts` ADD CONSTRAINT `wanted_posts_post_id_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `idx_addresses_user_id` ON `addresses` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_addresses_ward_name` ON `addresses` (`district_name`);--> statement-breakpoint
CREATE INDEX `idx_addresses_ward_name_district_name_province_id` ON `addresses` (`ward_name`,`district_name`,`province_name`);--> statement-breakpoint
CREATE INDEX `idx_assets_post_id` ON `assets` (`post_id`);--> statement-breakpoint
CREATE INDEX `idx_assets_user_id_post_id` ON `assets` (`user_id`,`post_id`);--> statement-breakpoint
CREATE INDEX `idx_chat_members_last_read_at_joined_at` ON `chat_members` (`last_read_at`,`joined_at`);--> statement-breakpoint
CREATE INDEX `idx_post_comment_closures_ancestor_id_descendant_id` ON `post_comment_closures` (`descendant_id`,`ancestor_id`);--> statement-breakpoint
CREATE INDEX `idx_post_comment_closures_descendant_id` ON `post_comment_closures` (`descendant_id`);--> statement-breakpoint
CREATE INDEX `idx_post_comment_closures_ancestor_id` ON `post_comment_closures` (`ancestor_id`);--> statement-breakpoint
CREATE INDEX `idx_tokens_value_type` ON `tokens` (`value`,`type`);