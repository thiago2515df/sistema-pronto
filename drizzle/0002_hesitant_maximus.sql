ALTER TABLE `proposals` ADD `status` enum('pending','viewed','approved','expired') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `proposals` ADD `viewedAt` timestamp;--> statement-breakpoint
ALTER TABLE `proposals` ADD `approvedAt` timestamp;--> statement-breakpoint
ALTER TABLE `proposals` ADD `expiresAt` timestamp;--> statement-breakpoint
ALTER TABLE `proposals` ADD `viewCount` int DEFAULT 0 NOT NULL;