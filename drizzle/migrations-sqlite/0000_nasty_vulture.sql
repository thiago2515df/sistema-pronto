CREATE TABLE `proposals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`packageName` text,
	`clientName` text NOT NULL,
	`departureDate` text NOT NULL,
	`returnDate` text NOT NULL,
	`adults` integer DEFAULT 2 NOT NULL,
	`children` integer DEFAULT 0 NOT NULL,
	`childrenAges` text,
	`days` integer,
	`nights` integer,
	`coverImageUrl` text,
	`hotelName` text,
	`hotelPhotos` text,
	`includedItems` text NOT NULL,
	`pricePerPerson` integer NOT NULL,
	`totalPrice` integer NOT NULL,
	`downPayment` integer NOT NULL,
	`installments` integer NOT NULL,
	`installmentValue` integer NOT NULL,
	`firstInstallmentDate` text,
	`installmentDates` text NOT NULL,
	`phoneNumber` text,
	`email` text,
	`instagramUrl` text,
	`createdBy` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`viewedAt` integer,
	`approvedAt` integer,
	`expiresAt` integer,
	`viewCount` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`openId` text NOT NULL,
	`name` text,
	`email` text,
	`loginMethod` text,
	`role` text DEFAULT 'user' NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`lastSignedIn` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_openId_unique` ON `users` (`openId`);