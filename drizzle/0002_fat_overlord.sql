CREATE TABLE `assessment_campaign_reminder_schedulers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`schedulerKey` varchar(64) NOT NULL,
	`taskUid` varchar(65) NOT NULL,
	`cronExpression` varchar(64) NOT NULL,
	`timezone` varchar(64) NOT NULL DEFAULT 'America/Asuncion',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessment_campaign_reminder_schedulers_id` PRIMARY KEY(`id`),
	CONSTRAINT `assessment_campaign_reminder_schedulers_schedulerKey_unique` UNIQUE(`schedulerKey`),
	CONSTRAINT `assessment_campaign_reminder_schedulers_taskUid_unique` UNIQUE(`taskUid`)
);
--> statement-breakpoint
CREATE INDEX `assessment_campaign_scheduler_task_idx` ON `assessment_campaign_reminder_schedulers` (`taskUid`);