import { and, desc, eq, inArray } from "drizzle-orm";
import {
  assessmentCampaignParticipants,
  assessmentCampaignReminders,
  assessmentCampaignReminderSchedulers,
  assessmentCampaigns,
  type AssessmentCampaign,
} from "../../../drizzle/schema";
import { getDb } from "../../db";
import {
  assertCampaignWindow,
  buildReminderCopy,
  buildReminderIdempotencyKey,
  getCampaignStatusAt,
  getDueReminderTypes,
  getNextReminderAt,
  type CampaignReminderType,
  type CampaignStatus,
} from "./campaignsDomain";

export type CampaignParticipantInput = {
  employeeId: string;
  employeeName: string;
  employeeRole: string;
};

export type CreateCampaignInput = {
  title: string;
  templateId: string;
  templateName: string;
  startAt: Date;
  endAt: Date;
  timezone: string;
  participants: CampaignParticipantInput[];
};

function requireDb<T>(db: T | null): T {
  if (!db) throw new Error("La base de datos de campañas no está disponible.");
  return db;
}

function toSummary(campaign: AssessmentCampaign, participants: Array<typeof assessmentCampaignParticipants.$inferSelect>, reminders: Array<typeof assessmentCampaignReminders.$inferSelect>) {
  const completed = participants.filter(participant => participant.status === "completed").length;
  const latestReminder = reminders.sort((left, right) => right.deliveredAt.getTime() - left.deliveredAt.getTime())[0] ?? null;
  return {
    id: campaign.id,
    title: campaign.title,
    templateId: campaign.templateId,
    templateName: campaign.templateName,
    startAt: campaign.startAt,
    endAt: campaign.endAt,
    timezone: campaign.timezone,
    status: campaign.status,
    reminderScheduleTaskUid: campaign.reminderScheduleTaskUid,
    nextReminderAt: campaign.nextReminderAt,
    participantCount: participants.length,
    completedCount: completed,
    reminderCount: reminders.length,
    latestReminder: latestReminder ? {
      type: latestReminder.reminderType,
      title: latestReminder.title,
      deliveredAt: latestReminder.deliveredAt,
    } : null,
  };
}

export async function listCampaignSummaries() {
  const db = requireDb(await getDb());
  const campaigns = await db.select().from(assessmentCampaigns).orderBy(desc(assessmentCampaigns.createdAt));
  if (campaigns.length === 0) return [];

  const campaignIds = campaigns.map(campaign => campaign.id);
  const participants = await db.select().from(assessmentCampaignParticipants).where(inArray(assessmentCampaignParticipants.campaignId, campaignIds));
  const reminders = await db.select().from(assessmentCampaignReminders).where(inArray(assessmentCampaignReminders.campaignId, campaignIds));

  return campaigns.map(campaign => toSummary(
    campaign,
    participants.filter(participant => participant.campaignId === campaign.id),
    reminders.filter(reminder => reminder.campaignId === campaign.id),
  ));
}

export async function createCampaign(input: CreateCampaignInput) {
  assertCampaignWindow(input.startAt, input.endAt);
  if (input.participants.length === 0) throw new Error("Seleccioná al menos un participante.");
  const uniqueParticipants = Array.from(new Map(input.participants.map(participant => [participant.employeeId, participant])).values());

  const db = requireDb(await getDb());
  const now = new Date();
  const initialStatus = getCampaignStatusAt({ startAt: input.startAt, endAt: input.endAt, status: "scheduled" }, now);
  const nextReminderAt = getNextReminderAt({ startAt: input.startAt, endAt: input.endAt, status: initialStatus }, now);
  const result = await db.insert(assessmentCampaigns).values({
    title: input.title.trim(),
    templateId: input.templateId,
    templateName: input.templateName,
    startAt: input.startAt,
    endAt: input.endAt,
    timezone: input.timezone,
    status: initialStatus,
    nextReminderAt,
  });
  const campaignId = Number(result[0].insertId);
  await db.insert(assessmentCampaignParticipants).values(uniqueParticipants.map(participant => ({
    campaignId,
    employeeId: participant.employeeId,
    employeeName: participant.employeeName,
    employeeRole: participant.employeeRole,
  })));

  const campaign = (await db.select().from(assessmentCampaigns).where(eq(assessmentCampaigns.id, campaignId)).limit(1))[0];
  if (!campaign) throw new Error("No fue posible recuperar la campaña creada.");
  return campaign;
}

export async function attachCampaignSchedule(campaignId: number, taskUid: string, nextExecutionAt?: string | null) {
  const db = requireDb(await getDb());
  await db.update(assessmentCampaigns)
    .set({ reminderScheduleTaskUid: taskUid, nextReminderAt: nextExecutionAt ? new Date(nextExecutionAt) : undefined })
    .where(eq(assessmentCampaigns.id, campaignId));
}

export async function updateCampaignStatus(campaignId: number, status: CampaignStatus) {
  const db = requireDb(await getDb());
  await db.update(assessmentCampaigns).set({ status }).where(eq(assessmentCampaigns.id, campaignId));
}

export async function getCampaignById(campaignId: number) {
  const db = requireDb(await getDb());
  return (await db.select().from(assessmentCampaigns).where(eq(assessmentCampaigns.id, campaignId)).limit(1))[0] ?? null;
}

export async function getCampaignByScheduleTaskUid(taskUid: string) {
  const db = requireDb(await getDb());
  return (await db.select().from(assessmentCampaigns).where(eq(assessmentCampaigns.reminderScheduleTaskUid, taskUid)).limit(1))[0] ?? null;
}

export async function isCampaignReminderScheduler(taskUid: string) {
  const db = requireDb(await getDb());
  const scheduler = await db.select({ id: assessmentCampaignReminderSchedulers.id })
    .from(assessmentCampaignReminderSchedulers)
    .where(eq(assessmentCampaignReminderSchedulers.taskUid, taskUid))
    .limit(1);
  return scheduler.length > 0;
}

async function emitCampaignReminders(campaign: AssessmentCampaign, now: Date) {
  const db = requireDb(await getDb());
  const effectiveStatus = getCampaignStatusAt(campaign, now);
  if (effectiveStatus !== campaign.status) await updateCampaignStatus(campaign.id, effectiveStatus);
  const dueTypes = getDueReminderTypes({ ...campaign, status: effectiveStatus }, now);
  const participants = await db.select().from(assessmentCampaignParticipants)
    .where(and(eq(assessmentCampaignParticipants.campaignId, campaign.id), eq(assessmentCampaignParticipants.status, "pending")));

  let emitted = 0;
  for (const reminderType of dueTypes) {
    const copy = buildReminderCopy({ campaignTitle: campaign.title, endAt: campaign.endAt, type: reminderType });
    for (const participant of participants) {
      const idempotencyKey = buildReminderIdempotencyKey(campaign.id, participant.id, reminderType);
      const existing = await db.select({ id: assessmentCampaignReminders.id }).from(assessmentCampaignReminders)
        .where(eq(assessmentCampaignReminders.idempotencyKey, idempotencyKey)).limit(1);
      if (existing.length > 0) continue;
      await db.insert(assessmentCampaignReminders).values({
        campaignId: campaign.id,
        participantId: participant.id,
        reminderType,
        idempotencyKey,
        title: copy.title,
        message: copy.message,
      });
      emitted += 1;
    }
  }

  await db.update(assessmentCampaigns).set({
    status: effectiveStatus,
    nextReminderAt: getNextReminderAt({ ...campaign, status: effectiveStatus }, now),
  }).where(eq(assessmentCampaigns.id, campaign.id));

  return { ok: true, campaignId: campaign.id, status: effectiveStatus, dueTypes, emitted };
}

/**
 * Compatibility path for a campaign-specific scheduler already persisted in a
 * production installation. The standalone demo uses runAllCampaignReminders.
 */
export async function runCampaignReminders(taskUid: string, now = new Date()) {
  const campaign = await getCampaignByScheduleTaskUid(taskUid);
  if (!campaign) return { ok: true, skipped: "orphan" as const, emitted: 0 };
  return emitCampaignReminders(campaign, now);
}

/**
 * Evaluates every campaign using one platform-owned hourly task. This keeps
 * scheduling independent from the demo's intentionally absent user session.
 */
export async function runAllCampaignReminders(now = new Date()) {
  const db = requireDb(await getDb());
  const campaigns = await db.select().from(assessmentCampaigns)
    .where(inArray(assessmentCampaigns.status, ["scheduled", "active", "paused"]));
  const results = await Promise.all(campaigns.map(campaign => emitCampaignReminders(campaign, now)));
  return {
    ok: true,
    processed: results.length,
    emitted: results.reduce((total, result) => total + result.emitted, 0),
    results,
  };
}

export function createCampaignReminderJobName(campaignId: number) {
  return `assessment-campaign-${campaignId}-reminders`;
}

export function buildCampaignReminderDescription(campaignTitle: string) {
  return `Avisos internos de la campaña ${campaignTitle}: inicio, mitad y cierre 48h.`;
}

export { getCampaignStatusAt } from "./campaignsDomain";
export type { CampaignReminderType };
