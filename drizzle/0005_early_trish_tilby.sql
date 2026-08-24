CREATE TABLE `pilot_instrument_drafts` (
	`id` varchar(64) NOT NULL,
	`tenantId` varchar(64) NOT NULL,
	`pilotId` varchar(64) NOT NULL,
	`sourceInstrumentId` varchar(64),
	`title` varchar(180) NOT NULL,
	`description` varchar(500),
	`evaluationType` varchar(100) NOT NULL,
	`matrixVersion` varchar(100) NOT NULL,
	`formulaVersion` varchar(100) NOT NULL,
	`version` int NOT NULL,
	`state` enum('draft','in_review','approved') NOT NULL DEFAULT 'draft',
	`instrumentJson` text NOT NULL,
	`checksum` varchar(128),
	`reviewNote` varchar(500),
	`createdByUserId` int NOT NULL,
	`updatedByUserId` int NOT NULL,
	`reviewedByUserId` int,
	`submittedForReviewAt` timestamp,
	`approvedAt` timestamp,
	`approvedInstrumentId` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pilot_instrument_drafts_id` PRIMARY KEY(`id`),
	CONSTRAINT `pilot_instrument_drafts_version_unique` UNIQUE(`tenantId`,`pilotId`,`title`,`version`)
);
--> statement-breakpoint
ALTER TABLE `pilot_audit_events` MODIFY COLUMN `metadataJson` text NOT NULL;--> statement-breakpoint
ALTER TABLE `pilot_instruments` MODIFY COLUMN `campaignId` int;--> statement-breakpoint
CREATE INDEX `pilot_instrument_drafts_scope_idx` ON `pilot_instrument_drafts` (`tenantId`,`pilotId`,`state`);--> statement-breakpoint
CREATE INDEX `pilot_instrument_drafts_source_idx` ON `pilot_instrument_drafts` (`sourceInstrumentId`);