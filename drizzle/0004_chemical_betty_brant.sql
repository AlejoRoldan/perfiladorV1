CREATE TABLE `pilot_assessment_answers` (
	`id` varchar(64) NOT NULL,
	`tenantId` varchar(64) NOT NULL,
	`pilotId` varchar(64) NOT NULL,
	`assessmentId` varchar(64) NOT NULL,
	`questionId` varchar(100) NOT NULL,
	`flow` enum('values','competencies') NOT NULL,
	`responseJson` text NOT NULL,
	`scoredValue` int,
	`savedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`submittedAt` timestamp,
	CONSTRAINT `pilot_assessment_answers_id` PRIMARY KEY(`id`),
	CONSTRAINT `pilot_answers_question_unique` UNIQUE(`assessmentId`,`questionId`)
);
--> statement-breakpoint
CREATE TABLE `pilot_assessments` (
	`id` varchar(64) NOT NULL,
	`tenantId` varchar(64) NOT NULL,
	`pilotId` varchar(64) NOT NULL,
	`campaignId` int NOT NULL,
	`instrumentId` varchar(64) NOT NULL,
	`participantId` varchar(64) NOT NULL,
	`state` enum('assigned','in_progress','submitted','locked') NOT NULL DEFAULT 'assigned',
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	`submittedAt` timestamp,
	`lockedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pilot_assessments_id` PRIMARY KEY(`id`),
	CONSTRAINT `pilot_assessments_assignment_unique` UNIQUE(`instrumentId`,`participantId`)
);
--> statement-breakpoint
CREATE TABLE `pilot_audit_events` (
	`id` varchar(64) NOT NULL,
	`tenantId` varchar(64) NOT NULL,
	`pilotId` varchar(64) NOT NULL,
	`actorUserId` int,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(80) NOT NULL,
	`entityId` varchar(64) NOT NULL,
	`metadataJson` text NOT NULL,
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pilot_audit_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pilot_diagnoses` (
	`id` varchar(64) NOT NULL,
	`tenantId` varchar(64) NOT NULL,
	`pilotId` varchar(64) NOT NULL,
	`assessmentId` varchar(64) NOT NULL,
	`formulaVersion` varchar(100) NOT NULL,
	`resultJson` text NOT NULL,
	`calculatedAt` timestamp NOT NULL DEFAULT (now()),
	`calculatedByUserId` int NOT NULL,
	CONSTRAINT `pilot_diagnoses_id` PRIMARY KEY(`id`),
	CONSTRAINT `pilot_diagnoses_assessmentId_unique` UNIQUE(`assessmentId`)
);
--> statement-breakpoint
CREATE TABLE `pilot_instruments` (
	`id` varchar(64) NOT NULL,
	`tenantId` varchar(64) NOT NULL,
	`pilotId` varchar(64) NOT NULL,
	`campaignId` int NOT NULL,
	`matrixVersion` varchar(100) NOT NULL,
	`formulaVersion` varchar(100) NOT NULL,
	`checksum` varchar(128) NOT NULL,
	`instrumentJson` text NOT NULL,
	`approvedByUserId` int NOT NULL,
	`approvedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pilot_instruments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pilot_participants` (
	`id` varchar(64) NOT NULL,
	`tenantId` varchar(64) NOT NULL,
	`pilotId` varchar(64) NOT NULL,
	`linkedUserId` int,
	`employeeExternalId` varchar(100) NOT NULL,
	`displayName` varchar(180) NOT NULL,
	`roleTitle` varchar(180) NOT NULL,
	`seniority` varchar(64),
	`area` varchar(120),
	`squad` varchar(120),
	`reportCode` varchar(64) NOT NULL,
	`status` enum('invited','active','revoked') NOT NULL DEFAULT 'invited',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pilot_participants_id` PRIMARY KEY(`id`),
	CONSTRAINT `pilot_participants_external_id_unique` UNIQUE(`tenantId`,`pilotId`,`employeeExternalId`),
	CONSTRAINT `pilot_participants_report_code_unique` UNIQUE(`tenantId`,`pilotId`,`reportCode`),
	CONSTRAINT `pilot_participants_user_unique` UNIQUE(`tenantId`,`pilotId`,`linkedUserId`)
);
--> statement-breakpoint
CREATE TABLE `talent_pilots` (
	`id` varchar(64) NOT NULL,
	`tenantId` varchar(64) NOT NULL,
	`code` varchar(64) NOT NULL,
	`name` varchar(180) NOT NULL,
	`dataClassification` enum('real') NOT NULL DEFAULT 'real',
	`status` enum('draft','active','closed') NOT NULL DEFAULT 'draft',
	`retentionUntil` timestamp,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `talent_pilots_id` PRIMARY KEY(`id`),
	CONSTRAINT `talent_pilots_tenant_code_unique` UNIQUE(`tenantId`,`code`)
);
--> statement-breakpoint
CREATE TABLE `talent_tenant_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `talent_tenant_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `talent_tenant_member_unique` UNIQUE(`tenantId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `talent_tenants` (
	`id` varchar(64) NOT NULL,
	`code` varchar(64) NOT NULL,
	`name` varchar(180) NOT NULL,
	`status` enum('active','suspended') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `talent_tenants_id` PRIMARY KEY(`id`),
	CONSTRAINT `talent_tenants_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `assessment_campaign_participants` ADD `tenantId` varchar(64);--> statement-breakpoint
ALTER TABLE `assessment_campaign_participants` ADD `pilotId` varchar(64);--> statement-breakpoint
ALTER TABLE `assessment_campaign_participants` ADD `pilotParticipantId` varchar(64);--> statement-breakpoint
ALTER TABLE `assessment_campaigns` ADD `tenantId` varchar(64);--> statement-breakpoint
ALTER TABLE `assessment_campaigns` ADD `pilotId` varchar(64);--> statement-breakpoint
CREATE INDEX `pilot_answers_scope_idx` ON `pilot_assessment_answers` (`tenantId`,`pilotId`,`assessmentId`);--> statement-breakpoint
CREATE INDEX `pilot_assessments_scope_idx` ON `pilot_assessments` (`tenantId`,`pilotId`,`campaignId`,`participantId`);--> statement-breakpoint
CREATE INDEX `pilot_audit_scope_idx` ON `pilot_audit_events` (`tenantId`,`pilotId`,`occurredAt`);--> statement-breakpoint
CREATE INDEX `pilot_diagnoses_scope_idx` ON `pilot_diagnoses` (`tenantId`,`pilotId`,`assessmentId`);--> statement-breakpoint
CREATE INDEX `pilot_instruments_scope_idx` ON `pilot_instruments` (`tenantId`,`pilotId`,`campaignId`);--> statement-breakpoint
CREATE INDEX `pilot_participants_scope_idx` ON `pilot_participants` (`tenantId`,`pilotId`,`status`);--> statement-breakpoint
CREATE INDEX `talent_pilots_tenant_status_idx` ON `talent_pilots` (`tenantId`,`status`);--> statement-breakpoint
CREATE INDEX `talent_tenant_members_user_idx` ON `talent_tenant_members` (`userId`);--> statement-breakpoint
CREATE INDEX `talent_tenants_status_idx` ON `talent_tenants` (`status`);--> statement-breakpoint
CREATE INDEX `assessment_campaign_participants_scope_idx` ON `assessment_campaign_participants` (`tenantId`,`pilotId`,`pilotParticipantId`);--> statement-breakpoint
CREATE INDEX `assessment_campaigns_tenant_pilot_idx` ON `assessment_campaigns` (`tenantId`,`pilotId`);
