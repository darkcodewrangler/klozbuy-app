CREATE TABLE `business_metrics` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`date` timestamp NOT NULL,
	`active_listings` int DEFAULT 0,
	`new_listings` int DEFAULT 0,
	`sold_listings` int DEFAULT 0,
	`expired_listings` int DEFAULT 0,
	`total_views` int DEFAULT 0,
	`total_inquiries` int DEFAULT 0,
	`total_favorites` int DEFAULT 0,
	`total_revenue` decimal(12,2) DEFAULT 0,
	`average_order_value` decimal(12,2) DEFAULT 0,
	`average_response_time` int,
	`response_rate` decimal(5,2) DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `business_metrics_id` PRIMARY KEY(`id`),
	CONSTRAINT `business_metrics_unique_idx` UNIQUE(`user_id`,`date`)
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`listing_id` varchar(36) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`),
	CONSTRAINT `favorites_unique_idx` UNIQUE(`user_id`,`listing_id`)
);
--> statement-breakpoint
CREATE TABLE `listing_inquiries` (
	`id` varchar(36) NOT NULL,
	`listing_id` varchar(36) NOT NULL,
	`inquirer_id` varchar(36) NOT NULL,
	`message` text NOT NULL,
	`is_public` boolean DEFAULT true,
	`parent_id` varchar(36),
	`status` enum('pending','answered','resolved') DEFAULT 'pending',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `listing_inquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `listing_media` (
	`id` varchar(36) NOT NULL,
	`listing_id` varchar(36) NOT NULL,
	`media_id` varchar(36) NOT NULL,
	`is_primary` boolean DEFAULT false,
	`sort_order` int DEFAULT 0,
	`alt_text` varchar(500),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `listing_media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `listings` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`category` varchar(100) NOT NULL,
	`subcategory` varchar(100),
	`type` enum('product','service') NOT NULL,
	`status` enum('active','sold','expired','draft','deleted') DEFAULT 'active',
	`condition` enum('new','used','refurbished'),
	`price` decimal(12,2),
	`original_price` decimal(12,2),
	`currency` varchar(3) DEFAULT 'NGN',
	`price_type` enum('fixed','negotiable','auction','free') DEFAULT 'fixed',
	`is_negotiable` boolean DEFAULT false,
	`location_id` varchar(36),
	`delivery_options` json,
	`delivery_radius` int,
	`delivery_fee` decimal(10,2),
	`brand` varchar(100),
	`model` varchar(100),
	`sku` varchar(100),
	`stock_quantity` int,
	`min_order_quantity` int DEFAULT 1,
	`weight` decimal(8,3),
	`dimensions` json,
	`service_type` varchar(100),
	`duration` varchar(100),
	`availability` json,
	`service_radius` int,
	`experience_years` int,
	`views_count` int DEFAULT 0,
	`inquiries_count` int DEFAULT 0,
	`favorites_count` int DEFAULT 0,
	`shares_count` int DEFAULT 0,
	`is_promoted` boolean DEFAULT false,
	`promotion_ends_at` timestamp,
	`tags` json,
	`search_keywords` text,
	`published_at` timestamp,
	`expires_at` timestamp,
	`sold_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `listings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `request_responses` (
	`id` varchar(36) NOT NULL,
	`request_id` varchar(36) NOT NULL,
	`responder_id` varchar(36) NOT NULL,
	`message` text NOT NULL,
	`proposed_price` decimal(12,2),
	`currency` varchar(3) DEFAULT 'NGN',
	`availability` varchar(200),
	`status` enum('pending','accepted','rejected','withdrawn') DEFAULT 'pending',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `request_responses_id` PRIMARY KEY(`id`),
	CONSTRAINT `request_responses_unique_idx` UNIQUE(`request_id`,`responder_id`)
);
--> statement-breakpoint
CREATE TABLE `requests` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text NOT NULL,
	`category` varchar(100) NOT NULL,
	`subcategory` varchar(100),
	`budget_min` decimal(12,2),
	`budget_max` decimal(12,2),
	`currency` varchar(3) DEFAULT 'NGN',
	`location_id` varchar(36),
	`search_radius` int DEFAULT 10,
	`status` enum('active','fulfilled','expired','cancelled') DEFAULT 'active',
	`urgency` enum('low','medium','high','urgent') DEFAULT 'medium',
	`responses_count` int DEFAULT 0,
	`views_count` int DEFAULT 0,
	`needed_by` timestamp,
	`expires_at` timestamp,
	`fulfilled_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `saved_searches` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`search_query` text NOT NULL,
	`filters` json,
	`alerts_enabled` boolean DEFAULT true,
	`alert_frequency` enum('instant','daily','weekly') DEFAULT 'daily',
	`last_alert_sent` timestamp,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `saved_searches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seller_follows` (
	`id` varchar(36) NOT NULL,
	`follower_id` varchar(36) NOT NULL,
	`seller_id` varchar(36) NOT NULL,
	`notifications_enabled` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `seller_follows_id` PRIMARY KEY(`id`),
	CONSTRAINT `seller_follows_unique_idx` UNIQUE(`follower_id`,`seller_id`)
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`preferred_categories` json,
	`price_ranges` json,
	`preferred_brands` json,
	`search_radius` int DEFAULT 10,
	`delivery_preferences` json,
	`notification_settings` json,
	`privacy_settings` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_preferences_unique_idx` UNIQUE(`user_id`)
);
--> statement-breakpoint
ALTER TABLE `business_metrics` ADD CONSTRAINT `business_metrics_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_listing_id_listings_id_fk` FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `listing_inquiries` ADD CONSTRAINT `listing_inquiries_listing_id_listings_id_fk` FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `listing_inquiries` ADD CONSTRAINT `listing_inquiries_inquirer_id_users_id_fk` FOREIGN KEY (`inquirer_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `listing_inquiries` ADD CONSTRAINT `listing_inquiries_parent_id_listing_inquiries_id_fk` FOREIGN KEY (`parent_id`) REFERENCES `listing_inquiries`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `listing_media` ADD CONSTRAINT `listing_media_listing_id_listings_id_fk` FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `listing_media` ADD CONSTRAINT `listing_media_media_id_media_id_fk` FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `listings` ADD CONSTRAINT `listings_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `listings` ADD CONSTRAINT `listings_location_id_locations_id_fk` FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `request_responses` ADD CONSTRAINT `request_responses_request_id_requests_id_fk` FOREIGN KEY (`request_id`) REFERENCES `requests`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `request_responses` ADD CONSTRAINT `request_responses_responder_id_users_id_fk` FOREIGN KEY (`responder_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `requests` ADD CONSTRAINT `requests_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `requests` ADD CONSTRAINT `requests_location_id_locations_id_fk` FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `saved_searches` ADD CONSTRAINT `saved_searches_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `seller_follows` ADD CONSTRAINT `seller_follows_follower_id_users_id_fk` FOREIGN KEY (`follower_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `seller_follows` ADD CONSTRAINT `seller_follows_seller_id_users_id_fk` FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_preferences` ADD CONSTRAINT `user_preferences_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `business_metrics_user_id_idx` ON `business_metrics` (`user_id`);--> statement-breakpoint
CREATE INDEX `business_metrics_date_idx` ON `business_metrics` (`date`);--> statement-breakpoint
CREATE INDEX `favorites_user_id_idx` ON `favorites` (`user_id`);--> statement-breakpoint
CREATE INDEX `favorites_listing_id_idx` ON `favorites` (`listing_id`);--> statement-breakpoint
CREATE INDEX `listing_inquiries_listing_id_idx` ON `listing_inquiries` (`listing_id`);--> statement-breakpoint
CREATE INDEX `listing_inquiries_inquirer_id_idx` ON `listing_inquiries` (`inquirer_id`);--> statement-breakpoint
CREATE INDEX `listing_inquiries_parent_id_idx` ON `listing_inquiries` (`parent_id`);--> statement-breakpoint
CREATE INDEX `listing_inquiries_status_idx` ON `listing_inquiries` (`status`);--> statement-breakpoint
CREATE INDEX `listing_inquiries_is_public_idx` ON `listing_inquiries` (`is_public`);--> statement-breakpoint
CREATE INDEX `listing_media_listing_id_idx` ON `listing_media` (`listing_id`);--> statement-breakpoint
CREATE INDEX `listing_media_media_id_idx` ON `listing_media` (`media_id`);--> statement-breakpoint
CREATE INDEX `listing_media_is_primary_idx` ON `listing_media` (`is_primary`);--> statement-breakpoint
CREATE INDEX `listing_media_sort_order_idx` ON `listing_media` (`sort_order`);--> statement-breakpoint
CREATE INDEX `listings_user_id_idx` ON `listings` (`user_id`);--> statement-breakpoint
CREATE INDEX `listings_category_idx` ON `listings` (`category`);--> statement-breakpoint
CREATE INDEX `listings_subcategory_idx` ON `listings` (`subcategory`);--> statement-breakpoint
CREATE INDEX `listings_type_idx` ON `listings` (`type`);--> statement-breakpoint
CREATE INDEX `listings_status_idx` ON `listings` (`status`);--> statement-breakpoint
CREATE INDEX `listings_condition_idx` ON `listings` (`condition`);--> statement-breakpoint
CREATE INDEX `listings_price_idx` ON `listings` (`price`);--> statement-breakpoint
CREATE INDEX `listings_location_id_idx` ON `listings` (`location_id`);--> statement-breakpoint
CREATE INDEX `listings_brand_idx` ON `listings` (`brand`);--> statement-breakpoint
CREATE INDEX `listings_service_type_idx` ON `listings` (`service_type`);--> statement-breakpoint
CREATE INDEX `listings_is_promoted_idx` ON `listings` (`is_promoted`);--> statement-breakpoint
CREATE INDEX `listings_published_at_idx` ON `listings` (`published_at`);--> statement-breakpoint
CREATE INDEX `listings_expires_at_idx` ON `listings` (`expires_at`);--> statement-breakpoint
CREATE INDEX `listings_created_at_idx` ON `listings` (`created_at`);--> statement-breakpoint
CREATE INDEX `request_responses_request_id_idx` ON `request_responses` (`request_id`);--> statement-breakpoint
CREATE INDEX `request_responses_responder_id_idx` ON `request_responses` (`responder_id`);--> statement-breakpoint
CREATE INDEX `request_responses_status_idx` ON `request_responses` (`status`);--> statement-breakpoint
CREATE INDEX `requests_user_id_idx` ON `requests` (`user_id`);--> statement-breakpoint
CREATE INDEX `requests_category_idx` ON `requests` (`category`);--> statement-breakpoint
CREATE INDEX `requests_status_idx` ON `requests` (`status`);--> statement-breakpoint
CREATE INDEX `requests_urgency_idx` ON `requests` (`urgency`);--> statement-breakpoint
CREATE INDEX `requests_location_id_idx` ON `requests` (`location_id`);--> statement-breakpoint
CREATE INDEX `requests_needed_by_idx` ON `requests` (`needed_by`);--> statement-breakpoint
CREATE INDEX `requests_expires_at_idx` ON `requests` (`expires_at`);--> statement-breakpoint
CREATE INDEX `requests_created_at_idx` ON `requests` (`created_at`);--> statement-breakpoint
CREATE INDEX `saved_searches_user_id_idx` ON `saved_searches` (`user_id`);--> statement-breakpoint
CREATE INDEX `saved_searches_alerts_enabled_idx` ON `saved_searches` (`alerts_enabled`);--> statement-breakpoint
CREATE INDEX `saved_searches_is_active_idx` ON `saved_searches` (`is_active`);--> statement-breakpoint
CREATE INDEX `seller_follows_follower_id_idx` ON `seller_follows` (`follower_id`);--> statement-breakpoint
CREATE INDEX `seller_follows_seller_id_idx` ON `seller_follows` (`seller_id`);--> statement-breakpoint
CREATE INDEX `user_preferences_user_id_idx` ON `user_preferences` (`user_id`);