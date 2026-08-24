CREATE TABLE `assessment_campaign_participants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`employeeId` varchar(100) NOT NULL,
	`employeeName` varchar(180) NOT NULL,
	`employeeRole` varchar(180) NOT NULL,
	`status` enum('pending','in_progress','completed') NOT NULL DEFAULT 'pending',
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `assessment_campaign_participants_id` PRIMARY KEY(`id`),
	CONSTRAINT `assessment_campaign_participant_unique` UNIQUE(`campaignId`,`employeeId`)
);
--> statement-breakpoint
CREATE TABLE `assessment_campaign_reminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`participantId` int NOT NULL,
	`reminderType` enum('opening','midpoint','closing_48h') NOT NULL,
	`idempotencyKey` varchar(180) NOT NULL,
	`title` varchar(220) NOT NULL,
	`message` text NOT NULL,
	`deliveredAt` timestamp NOT NULL DEFAULT (now()),
	`readAt` timestamp,
	CONSTRAINT `assessment_campaign_reminders_id` PRIMARY KEY(`id`),
	CONSTRAINT `assessment_campaign_reminders_idempotency_unique` UNIQUE(`idempotencyKey`)
);
--> statement-breakpoint
CREATE TABLE `assessment_campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(180) NOT NULL,
	`templateId` varchar(100) NOT NULL,
	`templateName` varchar(220) NOT NULL,
	`startAt` timestamp NOT NULL,
	`endAt` timestamp NOT NULL,
	`timezone` varchar(64) NOT NULL DEFAULT 'America/Asuncion',
	`status` enum('scheduled','active','paused','closed') NOT NULL DEFAULT 'scheduled',
	`reminderScheduleTaskUid` varchar(65),
	`nextReminderAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessment_campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `assessment_campaign_participants_campaign_idx` ON `assessment_campaign_participants` (`campaignId`);--> statement-breakpoint
CREATE INDEX `assessment_campaign_reminders_campaign_idx` ON `assessment_campaign_reminders` (`campaignId`);--> statement-breakpoint
CREATE INDEX `assessment_campaign_reminders_participant_idx` ON `assessment_campaign_reminders` (`participantId`);--> statement-breakpoint
CREATE INDEX `assessment_campaigns_status_idx` ON `assessment_campaigns` (`status`);--> statement-breakpoint
CREATE INDEX `assessment_campaigns_schedule_uid_idx` ON `assessment_campaigns` (`reminderScheduleTaskUid`);--> statement-breakpoint
CREATE INDEX `assessment_campaigns_window_idx` ON `assessment_campaigns` (`startAt`,`endAt`);