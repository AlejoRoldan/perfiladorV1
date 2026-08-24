import { index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";
import { accessRoles, accessStatuses } from "../shared/accessControl";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", accessRoles).default("collaborator").notNull(),
  accessStatus: mysqlEnum("accessStatus", accessStatuses).default("invited").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const assessmentCampaigns = mysqlTable(
  "assessment_campaigns",
  {
    id: int("id").autoincrement().primaryKey(),
    /** Null only for legacy demo campaigns; real campaigns must resolve a tenant and pilot. */
    tenantId: varchar("tenantId", { length: 64 }),
    pilotId: varchar("pilotId", { length: 64 }),
    title: varchar("title", { length: 180 }).notNull(),
    templateId: varchar("templateId", { length: 100 }).notNull(),
    templateName: varchar("templateName", { length: 220 }).notNull(),
    startAt: timestamp("startAt").notNull(),
    endAt: timestamp("endAt").notNull(),
    timezone: varchar("timezone", { length: 64 }).notNull().default("America/Asuncion"),
    status: mysqlEnum("status", ["scheduled", "active", "paused", "closed"]).notNull().default("scheduled"),
    reminderScheduleTaskUid: varchar("reminderScheduleTaskUid", { length: 65 }),
    nextReminderAt: timestamp("nextReminderAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("assessment_campaigns_status_idx").on(table.status),
    index("assessment_campaigns_tenant_pilot_idx").on(table.tenantId, table.pilotId),
    index("assessment_campaigns_schedule_uid_idx").on(table.reminderScheduleTaskUid),
    index("assessment_campaigns_window_idx").on(table.startAt, table.endAt),
  ]
);

export const assessmentCampaignParticipants = mysqlTable(
  "assessment_campaign_participants",
  {
    id: int("id").autoincrement().primaryKey(),
    campaignId: int("campaignId").notNull(),
    tenantId: varchar("tenantId", { length: 64 }),
    pilotId: varchar("pilotId", { length: 64 }),
    pilotParticipantId: varchar("pilotParticipantId", { length: 64 }),
    employeeId: varchar("employeeId", { length: 100 }).notNull(),
    employeeName: varchar("employeeName", { length: 180 }).notNull(),
    employeeRole: varchar("employeeRole", { length: 180 }).notNull(),
    status: mysqlEnum("status", ["pending", "in_progress", "completed"]).notNull().default("pending"),
    assignedAt: timestamp("assignedAt").defaultNow().notNull(),
    completedAt: timestamp("completedAt"),
  },
  table => [
    index("assessment_campaign_participants_campaign_idx").on(table.campaignId),
    index("assessment_campaign_participants_scope_idx").on(table.tenantId, table.pilotId, table.pilotParticipantId),
    uniqueIndex("assessment_campaign_participant_unique").on(table.campaignId, table.employeeId),
  ]
);

export const assessmentCampaignReminders = mysqlTable(
  "assessment_campaign_reminders",
  {
    id: int("id").autoincrement().primaryKey(),
    campaignId: int("campaignId").notNull(),
    participantId: int("participantId").notNull(),
    reminderType: mysqlEnum("reminderType", ["opening", "midpoint", "closing_48h"]).notNull(),
    idempotencyKey: varchar("idempotencyKey", { length: 180 }).notNull(),
    title: varchar("title", { length: 220 }).notNull(),
    message: text("message").notNull(),
    deliveredAt: timestamp("deliveredAt").defaultNow().notNull(),
    readAt: timestamp("readAt"),
  },
  table => [
    index("assessment_campaign_reminders_campaign_idx").on(table.campaignId),
    index("assessment_campaign_reminders_participant_idx").on(table.participantId),
    uniqueIndex("assessment_campaign_reminders_idempotency_unique").on(table.idempotencyKey),
  ]
);

/** A single platform-owned task evaluates all standalone demo campaigns hourly. */
export const assessmentCampaignReminderSchedulers = mysqlTable(
  "assessment_campaign_reminder_schedulers",
  {
    id: int("id").autoincrement().primaryKey(),
    schedulerKey: varchar("schedulerKey", { length: 64 }).notNull().unique(),
    taskUid: varchar("taskUid", { length: 65 }).notNull().unique(),
    cronExpression: varchar("cronExpression", { length: 64 }).notNull(),
    timezone: varchar("timezone", { length: 64 }).notNull().default("America/Asuncion"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("assessment_campaign_scheduler_task_idx").on(table.taskUid)]
);

/** A tenant is the primary data-isolation boundary for real pilots. */
export const talentTenants = mysqlTable(
  "talent_tenants",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    code: varchar("code", { length: 64 }).notNull().unique(),
    name: varchar("name", { length: 180 }).notNull(),
    status: mysqlEnum("status", ["active", "suspended"]).notNull().default("active"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("talent_tenants_status_idx").on(table.status)],
);

/** Membership is required even for People & Culture users; platform admins may access for support. */
export const talentTenantMembers = mysqlTable(
  "talent_tenant_members",
  {
    id: int("id").autoincrement().primaryKey(),
    tenantId: varchar("tenantId", { length: 64 }).notNull(),
    userId: int("userId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("talent_tenant_member_unique").on(table.tenantId, table.userId),
    index("talent_tenant_members_user_idx").on(table.userId),
  ],
);

export const talentPilots = mysqlTable(
  "talent_pilots",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    tenantId: varchar("tenantId", { length: 64 }).notNull(),
    code: varchar("code", { length: 64 }).notNull(),
    name: varchar("name", { length: 180 }).notNull(),
    dataClassification: mysqlEnum("dataClassification", ["real"]).notNull().default("real"),
    status: mysqlEnum("status", ["draft", "active", "closed"]).notNull().default("draft"),
    retentionUntil: timestamp("retentionUntil"),
    createdByUserId: int("createdByUserId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("talent_pilots_tenant_code_unique").on(table.tenantId, table.code),
    index("talent_pilots_tenant_status_idx").on(table.tenantId, table.status),
  ],
);

/** Identity is limited to the operational fields approved for the pilot. No assessment data belongs here. */
export const pilotParticipants = mysqlTable(
  "pilot_participants",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    tenantId: varchar("tenantId", { length: 64 }).notNull(),
    pilotId: varchar("pilotId", { length: 64 }).notNull(),
    linkedUserId: int("linkedUserId"),
    employeeExternalId: varchar("employeeExternalId", { length: 100 }).notNull(),
    displayName: varchar("displayName", { length: 180 }).notNull(),
    roleTitle: varchar("roleTitle", { length: 180 }).notNull(),
    seniority: varchar("seniority", { length: 64 }),
    area: varchar("area", { length: 120 }),
    squad: varchar("squad", { length: 120 }),
    reportCode: varchar("reportCode", { length: 64 }).notNull(),
    status: mysqlEnum("status", ["invited", "active", "revoked"]).notNull().default("invited"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("pilot_participants_external_id_unique").on(table.tenantId, table.pilotId, table.employeeExternalId),
    uniqueIndex("pilot_participants_report_code_unique").on(table.tenantId, table.pilotId, table.reportCode),
    uniqueIndex("pilot_participants_user_unique").on(table.tenantId, table.pilotId, table.linkedUserId),
    index("pilot_participants_scope_idx").on(table.tenantId, table.pilotId, table.status),
  ],
);

/** Every instrument is immutable after approval so calculations remain reproducible. */
export const pilotInstruments = mysqlTable(
  "pilot_instruments",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    tenantId: varchar("tenantId", { length: 64 }).notNull(),
    pilotId: varchar("pilotId", { length: 64 }).notNull(),
    /** An approved instrument can exist before a campaign; binding happens when it is assigned. */
    campaignId: int("campaignId"),
    matrixVersion: varchar("matrixVersion", { length: 100 }).notNull(),
    formulaVersion: varchar("formulaVersion", { length: 100 }).notNull(),
    checksum: varchar("checksum", { length: 128 }).notNull(),
    instrumentJson: text("instrumentJson").notNull(),
    approvedByUserId: int("approvedByUserId").notNull(),
    approvedAt: timestamp("approvedAt").defaultNow().notNull(),
  },
  table => [
    index("pilot_instruments_scope_idx").on(table.tenantId, table.pilotId, table.campaignId),
  ],
);

/**
 * Editable work area for People & Culture. Approval creates an immutable record in
 * pilot_instruments; later edits must start from a new draft/version.
 */
export const pilotInstrumentDrafts = mysqlTable(
  "pilot_instrument_drafts",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    tenantId: varchar("tenantId", { length: 64 }).notNull(),
    pilotId: varchar("pilotId", { length: 64 }).notNull(),
    sourceInstrumentId: varchar("sourceInstrumentId", { length: 64 }),
    title: varchar("title", { length: 180 }).notNull(),
    description: varchar("description", { length: 500 }),
    evaluationType: varchar("evaluationType", { length: 100 }).notNull(),
    matrixVersion: varchar("matrixVersion", { length: 100 }).notNull(),
    formulaVersion: varchar("formulaVersion", { length: 100 }).notNull(),
    version: int("version").notNull(),
    state: mysqlEnum("state", ["draft", "in_review", "approved"]).notNull().default("draft"),
    instrumentJson: text("instrumentJson").notNull(),
    checksum: varchar("checksum", { length: 128 }),
    reviewNote: varchar("reviewNote", { length: 500 }),
    createdByUserId: int("createdByUserId").notNull(),
    updatedByUserId: int("updatedByUserId").notNull(),
    reviewedByUserId: int("reviewedByUserId"),
    submittedForReviewAt: timestamp("submittedForReviewAt"),
    approvedAt: timestamp("approvedAt"),
    approvedInstrumentId: varchar("approvedInstrumentId", { length: 64 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("pilot_instrument_drafts_version_unique").on(table.tenantId, table.pilotId, table.title, table.version),
    index("pilot_instrument_drafts_scope_idx").on(table.tenantId, table.pilotId, table.state),
    index("pilot_instrument_drafts_source_idx").on(table.sourceInstrumentId),
  ],
);

export const pilotAssessments = mysqlTable(
  "pilot_assessments",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    tenantId: varchar("tenantId", { length: 64 }).notNull(),
    pilotId: varchar("pilotId", { length: 64 }).notNull(),
    campaignId: int("campaignId").notNull(),
    instrumentId: varchar("instrumentId", { length: 64 }).notNull(),
    participantId: varchar("participantId", { length: 64 }).notNull(),
    state: mysqlEnum("state", ["assigned", "in_progress", "submitted", "locked"]).notNull().default("assigned"),
    assignedAt: timestamp("assignedAt").defaultNow().notNull(),
    submittedAt: timestamp("submittedAt"),
    lockedAt: timestamp("lockedAt"),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("pilot_assessments_assignment_unique").on(table.instrumentId, table.participantId),
    index("pilot_assessments_scope_idx").on(table.tenantId, table.pilotId, table.campaignId, table.participantId),
  ],
);

export const pilotAssessmentAnswers = mysqlTable(
  "pilot_assessment_answers",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    tenantId: varchar("tenantId", { length: 64 }).notNull(),
    pilotId: varchar("pilotId", { length: 64 }).notNull(),
    assessmentId: varchar("assessmentId", { length: 64 }).notNull(),
    questionId: varchar("questionId", { length: 100 }).notNull(),
    flow: mysqlEnum("flow", ["values", "competencies"]).notNull(),
    responseJson: text("responseJson").notNull(),
    scoredValue: int("scoredValue"),
    savedAt: timestamp("savedAt").defaultNow().onUpdateNow().notNull(),
    submittedAt: timestamp("submittedAt"),
  },
  table => [
    uniqueIndex("pilot_answers_question_unique").on(table.assessmentId, table.questionId),
    index("pilot_answers_scope_idx").on(table.tenantId, table.pilotId, table.assessmentId),
  ],
);

export const pilotDiagnoses = mysqlTable(
  "pilot_diagnoses",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    tenantId: varchar("tenantId", { length: 64 }).notNull(),
    pilotId: varchar("pilotId", { length: 64 }).notNull(),
    assessmentId: varchar("assessmentId", { length: 64 }).notNull().unique(),
    formulaVersion: varchar("formulaVersion", { length: 100 }).notNull(),
    resultJson: text("resultJson").notNull(),
    calculatedAt: timestamp("calculatedAt").defaultNow().notNull(),
    calculatedByUserId: int("calculatedByUserId").notNull(),
  },
  table => [index("pilot_diagnoses_scope_idx").on(table.tenantId, table.pilotId, table.assessmentId)],
);

/** Audit records are minimized: never store raw answers or identity attributes in metadata. */
export const pilotAuditEvents = mysqlTable(
  "pilot_audit_events",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    tenantId: varchar("tenantId", { length: 64 }).notNull(),
    pilotId: varchar("pilotId", { length: 64 }).notNull(),
    actorUserId: int("actorUserId"),
    action: varchar("action", { length: 100 }).notNull(),
    entityType: varchar("entityType", { length: 80 }).notNull(),
    entityId: varchar("entityId", { length: 64 }).notNull(),
    metadataJson: text("metadataJson").notNull(),
    occurredAt: timestamp("occurredAt").defaultNow().notNull(),
  },
  table => [index("pilot_audit_scope_idx").on(table.tenantId, table.pilotId, table.occurredAt)],
);

export type AssessmentCampaign = typeof assessmentCampaigns.$inferSelect;
export type AssessmentCampaignParticipant = typeof assessmentCampaignParticipants.$inferSelect;
export type AssessmentCampaignReminder = typeof assessmentCampaignReminders.$inferSelect;
export type AssessmentCampaignReminderScheduler = typeof assessmentCampaignReminderSchedulers.$inferSelect;
export type TalentTenant = typeof talentTenants.$inferSelect;
export type TalentPilot = typeof talentPilots.$inferSelect;
export type PilotParticipant = typeof pilotParticipants.$inferSelect;
export type PilotInstrument = typeof pilotInstruments.$inferSelect;
export type PilotAssessment = typeof pilotAssessments.$inferSelect;
