CREATE TABLE `jobs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company` text NOT NULL,
	`role` text NOT NULL,
	`status` text DEFAULT 'Applied' NOT NULL,
	`date_applied` text NOT NULL,
	`url` text,
	`description` text,
	`notes` text
);
