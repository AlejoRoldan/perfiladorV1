import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { createHash } from "node:crypto";
import { TRPCError } from "@trpc/server";
import {
  assessmentCampaigns,
  pilotAssessmentAnswers,
  pilotAssessments,
  pilotAuditEvents,
  pilotDiagnoses,
  pilotInstrumentDrafts,
  pilotInstruments,
  pilotParticipants,
  talentPilots,
  talentTenantMembers,
  talentTenants,
  users,
  type User,
} from "../../../drizzle/schema";
import { getDb } from "../../db";
import { assertParticipantAccess, assertSamePilotScope, type PilotScope } from "../access/pilotScope";

type Actor = Pick<User, "id" | "role">;

export type PersistedInstrumentContent = {
  profileId: string;
  competencies: Array<{ id: string; name: string; expected: number; weight: number }>;
  questions: Array<{ id: string; competencyId: string; prompt: string; required: boolean; weight: number; type: "scale" }>;
  scale: { low: string; middle: string; high: string };
};

const toId = (prefix: string) => `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`;
const reportCode = () => `R-${crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`;
const checksumFor = (value: string) => createHash("sha256").update(value).digest("hex");

export function validateInstrumentContent(raw: string): PersistedInstrumentContent {
  let content: unknown;
  try {
    content = JSON.parse(raw);
  } catch {
    throw new TRPCError({ code: "BAD_REQUEST", message: "El contenido del instrumento no es JSON válido." });
  }
  if (!content || typeof content !== "object") throw new TRPCError({ code: "BAD_REQUEST", message: "El contenido del instrumento es obligatorio." });
  const candidate = content as Partial<PersistedInstrumentContent>;
  if (!candidate.profileId?.trim()) throw new TRPCError({ code: "BAD_REQUEST", message: "Seleccioná un perfil de referencia." });
  if (!Array.isArray(candidate.competencies) || candidate.competencies.length === 0) throw new TRPCError({ code: "BAD_REQUEST", message: "Seleccioná al menos una competencia." });
  if (!Array.isArray(candidate.questions) || candidate.questions.length < 2) throw new TRPCError({ code: "BAD_REQUEST", message: "El instrumento requiere al menos dos preguntas." });
  if (candidate.questions.some(question => !question.prompt?.trim() || !question.competencyId || question.type !== "scale" || question.weight <= 0)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Cada pregunta debe tener enunciado, competencia, escala 1–4 y ponderación positiva." });
  }
  if (!candidate.scale?.low?.trim() || !candidate.scale.middle?.trim() || !candidate.scale.high?.trim()) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Completá las etiquetas de escala 1, 2 y 4." });
  }
  return candidate as PersistedInstrumentContent;
}

export function assertInstrumentDraftAction(state: "draft" | "in_review" | "approved", action: "update" | "submit_review" | "approve") {
  const allowed = (action === "update" || action === "submit_review") ? state === "draft" : state === "in_review";
  if (!allowed) {
    const message = action === "update"
      ? "Solo se pueden editar instrumentos en borrador. Creá una nueva versión para cambiar uno revisado o aprobado."
      : action === "submit_review"
        ? "Solo un borrador puede enviarse a revisión."
        : "El instrumento debe estar en revisión antes de aprobarse.";
    throw new TRPCError({ code: "CONFLICT", message });
  }
}

function asScope(input: PilotScope): PilotScope {
  if (!input.tenantId || !input.pilotId) throw new TRPCError({ code: "BAD_REQUEST", message: "Tenant y piloto son obligatorios." });
  return input;
}

async function databaseOrThrow() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No fue posible acceder al repositorio del piloto." });
  return db;
}

async function requireTenantAccess(actor: Actor, tenantId: string) {
  if (actor.role === "admin") return;
  const db = await databaseOrThrow();
  const membership = await db.select({ id: talentTenantMembers.id })
    .from(talentTenantMembers)
    .where(and(eq(talentTenantMembers.tenantId, tenantId), eq(talentTenantMembers.userId, actor.id)))
    .limit(1);
  if (!membership[0]) throw new TRPCError({ code: "FORBIDDEN", message: "No tenés membresía activa para este tenant." });
}

async function requirePeopleOpsTenantAccess(actor: Actor, tenantId: string) {
  if (actor.role !== "admin" && actor.role !== "people_ops") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Solo People & Culture puede operar un piloto." });
  }
  await requireTenantAccess(actor, tenantId);
}

async function requirePilot(actor: Actor, scopeInput: PilotScope) {
  const scope = asScope(scopeInput);
  await requireTenantAccess(actor, scope.tenantId);
  const db = await databaseOrThrow();
  const pilot = await db.select().from(talentPilots)
    .where(and(eq(talentPilots.id, scope.pilotId), eq(talentPilots.tenantId, scope.tenantId)))
    .limit(1);
  if (!pilot[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Piloto no encontrado dentro del tenant solicitado." });
  return pilot[0];
}

async function recordAudit(actor: Actor, scope: PilotScope, action: string, entityType: string, entityId: string, metadata: Record<string, string | number | boolean> = {}) {
  const db = await databaseOrThrow();
  await db.insert(pilotAuditEvents).values({
    id: toId("audit"),
    tenantId: scope.tenantId,
    pilotId: scope.pilotId,
    actorUserId: actor.id,
    action,
    entityType,
    entityId,
    metadataJson: JSON.stringify(metadata),
  });
}

export async function createRealPilotWorkspace(actor: Actor, input: { tenantCode: string; tenantName: string; pilotCode: string; pilotName: string; retentionUntil?: Date | null }) {
  if (actor.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Solo la administración puede aprovisionar un tenant de datos reales." });
  const db = await databaseOrThrow();
  const tenantId = toId("tenant");
  const pilotId = toId("pilot");
  await db.transaction(async tx => {
    await tx.insert(talentTenants).values({ id: tenantId, code: input.tenantCode, name: input.tenantName });
    await tx.insert(talentTenantMembers).values({ tenantId, userId: actor.id });
    await tx.insert(talentPilots).values({
      id: pilotId,
      tenantId,
      code: input.pilotCode,
      name: input.pilotName,
      retentionUntil: input.retentionUntil ?? null,
      createdByUserId: actor.id,
    });
  });
  await recordAudit(actor, { tenantId, pilotId }, "pilot.created", "pilot", pilotId, { classification: "real" });
  return { tenantId, pilotId };
}

export async function listAccessiblePilots(actor: Actor) {
  const db = await databaseOrThrow();
  if (actor.role === "admin") {
    return db.select({
      tenantId: talentTenants.id, tenantName: talentTenants.name, tenantCode: talentTenants.code,
      pilotId: talentPilots.id, pilotName: talentPilots.name, pilotCode: talentPilots.code,
      pilotStatus: talentPilots.status, retentionUntil: talentPilots.retentionUntil,
    }).from(talentPilots).innerJoin(talentTenants, eq(talentPilots.tenantId, talentTenants.id)).orderBy(asc(talentTenants.name), asc(talentPilots.name));
  }
  if (actor.role === "people_ops") {
    return db.select({
      tenantId: talentTenants.id, tenantName: talentTenants.name, tenantCode: talentTenants.code,
      pilotId: talentPilots.id, pilotName: talentPilots.name, pilotCode: talentPilots.code,
      pilotStatus: talentPilots.status, retentionUntil: talentPilots.retentionUntil,
    }).from(talentPilots)
      .innerJoin(talentTenants, eq(talentPilots.tenantId, talentTenants.id))
      .innerJoin(talentTenantMembers, eq(talentTenantMembers.tenantId, talentTenants.id))
      .where(eq(talentTenantMembers.userId, actor.id))
      .orderBy(asc(talentTenants.name), asc(talentPilots.name));
  }
  return db.select({
    tenantId: talentTenants.id, tenantName: talentTenants.name, tenantCode: talentTenants.code,
    pilotId: talentPilots.id, pilotName: talentPilots.name, pilotCode: talentPilots.code,
    pilotStatus: talentPilots.status, retentionUntil: talentPilots.retentionUntil,
  }).from(pilotParticipants)
    .innerJoin(talentPilots, eq(pilotParticipants.pilotId, talentPilots.id))
    .innerJoin(talentTenants, eq(talentPilots.tenantId, talentTenants.id))
    .where(and(eq(pilotParticipants.linkedUserId, actor.id), eq(pilotParticipants.status, "active")))
    .orderBy(asc(talentTenants.name), asc(talentPilots.name));
}

export async function getPilotWorkspace(actor: Actor, scope: PilotScope) {
  const pilot = await requirePilot(actor, scope);
  const db = await databaseOrThrow();
  const [campaigns, instruments] = await Promise.all([
    db.select({ id: assessmentCampaigns.id, title: assessmentCampaigns.title, status: assessmentCampaigns.status, startAt: assessmentCampaigns.startAt, endAt: assessmentCampaigns.endAt })
      .from(assessmentCampaigns).where(and(eq(assessmentCampaigns.tenantId, scope.tenantId), eq(assessmentCampaigns.pilotId, scope.pilotId))).orderBy(asc(assessmentCampaigns.startAt)),
    db.select({ id: pilotInstruments.id, campaignId: pilotInstruments.campaignId, matrixVersion: pilotInstruments.matrixVersion, formulaVersion: pilotInstruments.formulaVersion, approvedAt: pilotInstruments.approvedAt })
      .from(pilotInstruments).where(and(eq(pilotInstruments.tenantId, scope.tenantId), eq(pilotInstruments.pilotId, scope.pilotId))),
  ]);
  const isOperator = actor.role === "admin" || actor.role === "people_ops";
  const participants = isOperator
    ? await db.select({ id: pilotParticipants.id, reportCode: pilotParticipants.reportCode, roleTitle: pilotParticipants.roleTitle, seniority: pilotParticipants.seniority, area: pilotParticipants.area, status: pilotParticipants.status })
      .from(pilotParticipants).where(and(eq(pilotParticipants.tenantId, scope.tenantId), eq(pilotParticipants.pilotId, scope.pilotId))).orderBy(asc(pilotParticipants.reportCode))
    : await db.select({ id: pilotParticipants.id, reportCode: pilotParticipants.reportCode, roleTitle: pilotParticipants.roleTitle, seniority: pilotParticipants.seniority, area: pilotParticipants.area, status: pilotParticipants.status })
      .from(pilotParticipants).where(and(eq(pilotParticipants.tenantId, scope.tenantId), eq(pilotParticipants.pilotId, scope.pilotId), eq(pilotParticipants.linkedUserId, actor.id))).limit(1);
  return { pilot: { id: pilot.id, tenantId: pilot.tenantId, name: pilot.name, code: pilot.code, status: pilot.status, retentionUntil: pilot.retentionUntil }, campaigns, instruments, participants };
}

export async function addPilotParticipant(actor: Actor, scope: PilotScope, input: { employeeExternalId: string; displayName: string; roleTitle: string; seniority?: string; area?: string; squad?: string; linkedUserId?: number | null }) {
  await requirePeopleOpsTenantAccess(actor, scope.tenantId);
  await requirePilot(actor, scope);
  const db = await databaseOrThrow();
  if (input.linkedUserId) {
    const [linkedUser] = await db.select({ id: users.id, accessStatus: users.accessStatus }).from(users)
      .where(and(eq(users.id, input.linkedUserId), eq(users.accessStatus, "active"))).limit(1);
    if (!linkedUser) throw new TRPCError({ code: "BAD_REQUEST", message: "La cuenta seleccionada no está activa y no puede recibir una evaluación." });
  }
  const participantId = toId("participant");
  const participant = { id: participantId, tenantId: scope.tenantId, pilotId: scope.pilotId, reportCode: reportCode(), status: input.linkedUserId ? "active" as const : "invited" as const, ...input };
  await db.insert(pilotParticipants).values(participant);
  await recordAudit(actor, scope, "participant.created", "participant", participantId, { hasLinkedUser: Boolean(input.linkedUserId) });
  return { id: participantId, reportCode: participant.reportCode };
}

export async function listEligibleParticipantUsers(actor: Actor, tenantId: string) {
  await requirePeopleOpsTenantAccess(actor, tenantId);
  const db = await databaseOrThrow();
  return db.select({ id: users.id, name: users.name, email: users.email, role: users.role })
    .from(users).where(eq(users.accessStatus, "active")).orderBy(asc(users.name));
}

export async function createScopedCampaign(actor: Actor, scope: PilotScope, input: { title: string; templateId: string; templateName: string; startAt: Date; endAt: Date; timezone: "America/Asuncion" }) {
  await requirePeopleOpsTenantAccess(actor, scope.tenantId);
  await requirePilot(actor, scope);
  const db = await databaseOrThrow();
  const result = await db.insert(assessmentCampaigns).values({ ...input, tenantId: scope.tenantId, pilotId: scope.pilotId, status: "scheduled" });
  const campaignId = Number(result[0].insertId);
  await recordAudit(actor, scope, "campaign.created", "campaign", String(campaignId));
  return { id: campaignId };
}

export async function createCampaignFromApprovedInstrument(actor: Actor, scope: PilotScope, input: { title: string; instrumentId: string; startAt: Date; endAt: Date; timezone: "America/Asuncion" }) {
  await requirePeopleOpsTenantAccess(actor, scope.tenantId);
  await requirePilot(actor, scope);
  if (input.endAt <= input.startAt) throw new TRPCError({ code: "BAD_REQUEST", message: "El cierre de la campaña debe ser posterior al inicio." });
  const db = await databaseOrThrow();
  const [instrument] = await db.select({ id: pilotInstruments.id, tenantId: pilotInstruments.tenantId, pilotId: pilotInstruments.pilotId, campaignId: pilotInstruments.campaignId, matrixVersion: pilotInstruments.matrixVersion })
    .from(pilotInstruments).where(eq(pilotInstruments.id, input.instrumentId)).limit(1);
  if (!instrument) throw new TRPCError({ code: "NOT_FOUND", message: "Instrumento aprobado no encontrado." });
  assertSamePilotScope(instrument, scope);
  if (instrument.campaignId) throw new TRPCError({ code: "CONFLICT", message: "Este instrumento ya está vinculado a otra campaña. Aprobá una nueva versión para reutilizarlo." });
  const result = await db.insert(assessmentCampaigns).values({
    tenantId: scope.tenantId,
    pilotId: scope.pilotId,
    title: input.title.trim(),
    templateId: instrument.id,
    templateName: `Instrumento aprobado · ${instrument.matrixVersion}`,
    startAt: input.startAt,
    endAt: input.endAt,
    timezone: input.timezone,
    status: "scheduled",
  });
  const campaignId = Number(result[0].insertId);
  await db.update(pilotInstruments).set({ campaignId }).where(and(eq(pilotInstruments.id, instrument.id), eq(pilotInstruments.tenantId, scope.tenantId), eq(pilotInstruments.pilotId, scope.pilotId)));
  await recordAudit(actor, scope, "campaign.created_from_instrument", "campaign", String(campaignId), { instrumentId: instrument.id });
  return { id: campaignId, instrumentId: instrument.id };
}

export async function createPilotInstrument(actor: Actor, scope: PilotScope, input: { campaignId: number; matrixVersion: string; formulaVersion: string; checksum: string; instrumentJson: string }) {
  await requirePeopleOpsTenantAccess(actor, scope.tenantId);
  await requirePilot(actor, scope);
  const db = await databaseOrThrow();
  const campaign = await db.select({ tenantId: assessmentCampaigns.tenantId, pilotId: assessmentCampaigns.pilotId }).from(assessmentCampaigns).where(eq(assessmentCampaigns.id, input.campaignId)).limit(1);
  if (!campaign[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Campaña no encontrada." });
  assertSamePilotScope({ tenantId: campaign[0].tenantId ?? "", pilotId: campaign[0].pilotId ?? "" }, scope);
  const instrumentId = toId("instrument");
  await db.insert(pilotInstruments).values({ id: instrumentId, tenantId: scope.tenantId, pilotId: scope.pilotId, approvedByUserId: actor.id, ...input });
  await recordAudit(actor, scope, "instrument.approved", "instrument", instrumentId, { campaignId: input.campaignId });
  return { id: instrumentId };
}

export async function assignPilotAssessment(actor: Actor, scope: PilotScope, input: { campaignId: number; instrumentId: string; participantId: string }) {
  await requirePeopleOpsTenantAccess(actor, scope.tenantId);
  await requirePilot(actor, scope);
  const db = await databaseOrThrow();
  const [instrument] = await db.select({ tenantId: pilotInstruments.tenantId, pilotId: pilotInstruments.pilotId, campaignId: pilotInstruments.campaignId }).from(pilotInstruments).where(eq(pilotInstruments.id, input.instrumentId)).limit(1);
  const [participant] = await db.select({ tenantId: pilotParticipants.tenantId, pilotId: pilotParticipants.pilotId }).from(pilotParticipants).where(eq(pilotParticipants.id, input.participantId)).limit(1);
  if (!instrument || !participant) throw new TRPCError({ code: "NOT_FOUND", message: "Instrumento o participante no encontrado." });
  assertSamePilotScope(instrument, scope);
  assertSamePilotScope(participant, scope);
  if (instrument.campaignId !== input.campaignId) throw new TRPCError({ code: "BAD_REQUEST", message: "El instrumento no pertenece a la campaña indicada." });
  const assessmentId = toId("assessment");
  await db.insert(pilotAssessments).values({ id: assessmentId, tenantId: scope.tenantId, pilotId: scope.pilotId, ...input });
  await recordAudit(actor, scope, "assessment.assigned", "assessment", assessmentId, { campaignId: input.campaignId });
  return { id: assessmentId };
}

export async function assignCampaignToParticipants(actor: Actor, scope: PilotScope, campaignId: number) {
  await requirePeopleOpsTenantAccess(actor, scope.tenantId);
  await requirePilot(actor, scope);
  const db = await databaseOrThrow();
  const [campaign] = await db.select({ id: assessmentCampaigns.id, tenantId: assessmentCampaigns.tenantId, pilotId: assessmentCampaigns.pilotId, templateId: assessmentCampaigns.templateId })
    .from(assessmentCampaigns).where(eq(assessmentCampaigns.id, campaignId)).limit(1);
  if (!campaign) throw new TRPCError({ code: "NOT_FOUND", message: "Campaña no encontrada." });
  assertSamePilotScope({ tenantId: campaign.tenantId ?? "", pilotId: campaign.pilotId ?? "" }, scope);
  const [instrument] = await db.select({ id: pilotInstruments.id, tenantId: pilotInstruments.tenantId, pilotId: pilotInstruments.pilotId, campaignId: pilotInstruments.campaignId })
    .from(pilotInstruments).where(eq(pilotInstruments.id, campaign.templateId)).limit(1);
  if (!instrument) throw new TRPCError({ code: "CONFLICT", message: "La campaña no tiene un instrumento aprobado vinculado." });
  assertSamePilotScope(instrument, scope);
  if (instrument.campaignId !== campaignId) throw new TRPCError({ code: "CONFLICT", message: "El instrumento vinculado no coincide con la campaña." });
  const participants = await db.select({ id: pilotParticipants.id }).from(pilotParticipants)
    .where(and(eq(pilotParticipants.tenantId, scope.tenantId), eq(pilotParticipants.pilotId, scope.pilotId), inArray(pilotParticipants.status, ["invited", "active"])));
  if (!participants.length) throw new TRPCError({ code: "BAD_REQUEST", message: "La campaña requiere al menos un participante invitado o activo." });
  let assigned = 0;
  for (const participant of participants) {
    const existing = await db.select({ id: pilotAssessments.id }).from(pilotAssessments)
      .where(and(eq(pilotAssessments.instrumentId, instrument.id), eq(pilotAssessments.participantId, participant.id))).limit(1);
    if (existing[0]) continue;
    await db.insert(pilotAssessments).values({ id: toId("assessment"), tenantId: scope.tenantId, pilotId: scope.pilotId, campaignId, instrumentId: instrument.id, participantId: participant.id, state: "assigned" });
    assigned += 1;
  }
  await recordAudit(actor, scope, "campaign.assessments_assigned", "campaign", String(campaignId), { assigned });
  return { assigned, participantCount: participants.length };
}

export async function listCampaignAssignments(actor: Actor, scope: PilotScope, campaignId: number) {
  await requirePeopleOpsTenantAccess(actor, scope.tenantId);
  await requirePilot(actor, scope);
  const db = await databaseOrThrow();
  const assessments = await db.select({ id: pilotAssessments.id, campaignId: pilotAssessments.campaignId, tenantId: pilotAssessments.tenantId, pilotId: pilotAssessments.pilotId, state: pilotAssessments.state, assignedAt: pilotAssessments.assignedAt, submittedAt: pilotAssessments.submittedAt, reportCode: pilotParticipants.reportCode, roleTitle: pilotParticipants.roleTitle })
    .from(pilotAssessments).innerJoin(pilotParticipants, eq(pilotAssessments.participantId, pilotParticipants.id))
    .where(and(eq(pilotAssessments.tenantId, scope.tenantId), eq(pilotAssessments.pilotId, scope.pilotId), eq(pilotAssessments.campaignId, campaignId)));
  return assessments;
}

export async function listOwnAssignedAssessments(actor: Actor, scope: PilotScope) {
  await requirePilot(actor, scope);
  const db = await databaseOrThrow();
  const [participant] = await db.select().from(pilotParticipants)
    .where(and(eq(pilotParticipants.tenantId, scope.tenantId), eq(pilotParticipants.pilotId, scope.pilotId), eq(pilotParticipants.linkedUserId, actor.id), eq(pilotParticipants.status, "active"))).limit(1);
  if (!participant) return [];
  const assessments = await db.select({ id: pilotAssessments.id, state: pilotAssessments.state, participantId: pilotAssessments.participantId, campaignId: pilotAssessments.campaignId, assignedAt: pilotAssessments.assignedAt, submittedAt: pilotAssessments.submittedAt, title: assessmentCampaigns.title, endAt: assessmentCampaigns.endAt, instrumentJson: pilotInstruments.instrumentJson, formulaVersion: pilotInstruments.formulaVersion })
    .from(pilotAssessments)
    .innerJoin(assessmentCampaigns, eq(pilotAssessments.campaignId, assessmentCampaigns.id))
    .innerJoin(pilotInstruments, eq(pilotAssessments.instrumentId, pilotInstruments.id))
    .where(and(eq(pilotAssessments.tenantId, scope.tenantId), eq(pilotAssessments.pilotId, scope.pilotId), eq(pilotAssessments.participantId, participant.id)));
  if (!assessments.length) return [];
  const answers = await db.select({ assessmentId: pilotAssessmentAnswers.assessmentId, questionId: pilotAssessmentAnswers.questionId, scoredValue: pilotAssessmentAnswers.scoredValue })
    .from(pilotAssessmentAnswers).where(and(eq(pilotAssessmentAnswers.tenantId, scope.tenantId), eq(pilotAssessmentAnswers.pilotId, scope.pilotId), inArray(pilotAssessmentAnswers.assessmentId, assessments.map(assessment => assessment.id))));
  return assessments.map(assessment => ({ ...assessment, answers: answers.filter(answer => answer.assessmentId === assessment.id) }));
}

export async function saveOwnAssessmentAnswers(actor: Actor, scope: PilotScope, input: { assessmentId: string; participantId: string; answers: Array<{ questionId: string; flow: "values" | "competencies"; responseJson: string; scoredValue?: number | null }> }) {
  await requirePilot(actor, scope);
  const db = await databaseOrThrow();
  const [assessment] = await db.select().from(pilotAssessments).where(eq(pilotAssessments.id, input.assessmentId)).limit(1);
  const [participant] = await db.select().from(pilotParticipants).where(eq(pilotParticipants.id, input.participantId)).limit(1);
  if (!assessment || !participant) throw new TRPCError({ code: "NOT_FOUND", message: "Evaluación o participante no encontrado." });
  assertSamePilotScope(assessment, scope);
  assertSamePilotScope(participant, scope);
  if (assessment.participantId !== participant.id) throw new TRPCError({ code: "FORBIDDEN", message: "La evaluación no pertenece al participante indicado." });
  assertParticipantAccess(actor, participant.linkedUserId, participant.id, input.participantId);
  if (assessment.state === "submitted" || assessment.state === "locked") throw new TRPCError({ code: "CONFLICT", message: "La evaluación ya fue enviada y no admite cambios." });
  for (const answer of input.answers) {
    await db.insert(pilotAssessmentAnswers).values({ id: toId("answer"), tenantId: scope.tenantId, pilotId: scope.pilotId, assessmentId: assessment.id, ...answer })
      .onDuplicateKeyUpdate({ set: { responseJson: answer.responseJson, scoredValue: answer.scoredValue ?? null, submittedAt: null } });
  }
  await db.update(pilotAssessments).set({ state: "in_progress" }).where(eq(pilotAssessments.id, assessment.id));
  await recordAudit(actor, scope, "assessment.draft_saved", "assessment", assessment.id, { answerCount: input.answers.length });
  return { success: true };
}

export async function submitOwnAssessment(actor: Actor, scope: PilotScope, input: { assessmentId: string; participantId: string }) {
  await requirePilot(actor, scope);
  const db = await databaseOrThrow();
  const [assessment] = await db.select().from(pilotAssessments).where(eq(pilotAssessments.id, input.assessmentId)).limit(1);
  const [participant] = await db.select().from(pilotParticipants).where(eq(pilotParticipants.id, input.participantId)).limit(1);
  if (!assessment || !participant) throw new TRPCError({ code: "NOT_FOUND", message: "Evaluación o participante no encontrado." });
  assertSamePilotScope(assessment, scope);
  assertSamePilotScope(participant, scope);
  assertParticipantAccess(actor, participant.linkedUserId, participant.id, input.participantId);
  if (assessment.state === "submitted" || assessment.state === "locked") throw new TRPCError({ code: "CONFLICT", message: "La evaluación ya fue enviada." });
  const answers = await db.select({ id: pilotAssessmentAnswers.id }).from(pilotAssessmentAnswers).where(and(eq(pilotAssessmentAnswers.assessmentId, assessment.id), eq(pilotAssessmentAnswers.tenantId, scope.tenantId), eq(pilotAssessmentAnswers.pilotId, scope.pilotId)));
  if (!answers.length) throw new TRPCError({ code: "BAD_REQUEST", message: "La evaluación no contiene respuestas para enviar." });
  const now = new Date();
  await db.update(pilotAssessmentAnswers).set({ submittedAt: now }).where(inArray(pilotAssessmentAnswers.id, answers.map(answer => answer.id)));
  await db.update(pilotAssessments).set({ state: "submitted", submittedAt: now, lockedAt: now }).where(eq(pilotAssessments.id, assessment.id));
  await recordAudit(actor, scope, "assessment.submitted", "assessment", assessment.id, { answerCount: answers.length });
  return { success: true };
}

export async function savePilotDiagnosis(actor: Actor, scope: PilotScope, input: { assessmentId: string; formulaVersion: string; resultJson: string }) {
  await requirePeopleOpsTenantAccess(actor, scope.tenantId);
  await requirePilot(actor, scope);
  const db = await databaseOrThrow();
  const [assessment] = await db.select({ tenantId: pilotAssessments.tenantId, pilotId: pilotAssessments.pilotId, state: pilotAssessments.state }).from(pilotAssessments).where(eq(pilotAssessments.id, input.assessmentId)).limit(1);
  if (!assessment) throw new TRPCError({ code: "NOT_FOUND", message: "Evaluación no encontrada." });
  assertSamePilotScope(assessment, scope);
  if (assessment.state !== "submitted" && assessment.state !== "locked") throw new TRPCError({ code: "BAD_REQUEST", message: "La evaluación debe estar enviada antes de calcular un diagnóstico." });
  const diagnosisId = toId("diagnosis");
  await db.insert(pilotDiagnoses).values({ id: diagnosisId, tenantId: scope.tenantId, pilotId: scope.pilotId, calculatedByUserId: actor.id, ...input })
    .onDuplicateKeyUpdate({ set: { formulaVersion: input.formulaVersion, resultJson: input.resultJson, calculatedByUserId: actor.id, calculatedAt: new Date() } });
  await recordAudit(actor, scope, "diagnosis.calculated", "diagnosis", diagnosisId, { assessmentId: input.assessmentId });
  return { id: diagnosisId };
}

export function buildDeterministicDiagnosis(content: PersistedInstrumentContent, answers: Array<{ questionId: string; scoredValue: number | null }>) {
  const answerByQuestion = new Map(answers.filter(answer => answer.scoredValue !== null).map(answer => [answer.questionId, answer.scoredValue as number]));
  const dimensions = content.competencies.map(competency => {
    const questions = content.questions.filter(question => question.competencyId === competency.id);
    const values = questions.map(question => answerByQuestion.get(question.id)).filter((value): value is number => value !== undefined);
    const observed = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
    const expected = Math.min(4, Math.max(1, competency.expected));
    const gap = observed === null ? null : Number((expected - observed).toFixed(2));
    return { id: competency.id, name: competency.name, expected, observed, gap, coverage: questions.length ? Number((values.length / questions.length).toFixed(2)) : 0, weight: competency.weight };
  });
  const weighted = dimensions.filter(item => item.observed !== null);
  const weightTotal = weighted.reduce((sum, item) => sum + item.weight, 0);
  const overall = weightTotal ? Number((weighted.reduce((sum, item) => sum + (item.observed ?? 0) * item.weight, 0) / weightTotal).toFixed(2)) : null;
  return { scale: "1-4", formula: "weighted_competency_average_v1", coverage: Number((weighted.length / Math.max(1, dimensions.length)).toFixed(2)), overall, dimensions };
}

export async function calculatePilotDiagnosis(actor: Actor, scope: PilotScope, assessmentId: string) {
  await requirePeopleOpsTenantAccess(actor, scope.tenantId);
  await requirePilot(actor, scope);
  const db = await databaseOrThrow();
  const [assessment] = await db.select({ id: pilotAssessments.id, tenantId: pilotAssessments.tenantId, pilotId: pilotAssessments.pilotId, state: pilotAssessments.state, instrumentId: pilotAssessments.instrumentId })
    .from(pilotAssessments).where(eq(pilotAssessments.id, assessmentId)).limit(1);
  if (!assessment) throw new TRPCError({ code: "NOT_FOUND", message: "Evaluación no encontrada." });
  assertSamePilotScope(assessment, scope);
  if (assessment.state !== "submitted" && assessment.state !== "locked") throw new TRPCError({ code: "CONFLICT", message: "El diagnóstico requiere una evaluación enviada." });
  const [instrument] = await db.select({ tenantId: pilotInstruments.tenantId, pilotId: pilotInstruments.pilotId, instrumentJson: pilotInstruments.instrumentJson, formulaVersion: pilotInstruments.formulaVersion })
    .from(pilotInstruments).where(eq(pilotInstruments.id, assessment.instrumentId)).limit(1);
  if (!instrument) throw new TRPCError({ code: "NOT_FOUND", message: "No se encontró el instrumento aprobado de esta evaluación." });
  assertSamePilotScope(instrument, scope);
  const answers = await db.select({ questionId: pilotAssessmentAnswers.questionId, scoredValue: pilotAssessmentAnswers.scoredValue })
    .from(pilotAssessmentAnswers).where(and(eq(pilotAssessmentAnswers.tenantId, scope.tenantId), eq(pilotAssessmentAnswers.pilotId, scope.pilotId), eq(pilotAssessmentAnswers.assessmentId, assessmentId)));
  const result = buildDeterministicDiagnosis(validateInstrumentContent(instrument.instrumentJson), answers);
  return savePilotDiagnosis(actor, scope, { assessmentId, formulaVersion: instrument.formulaVersion, resultJson: JSON.stringify(result) });
}

type StoredDiagnosis = {
  overall?: number | null;
  coverage?: number | null;
  formula?: string;
  dimensions?: Array<{ name: string; observed: number | null; expected: number; gap: number | null }>;
};

function parseStoredDiagnosis(value: string | null): StoredDiagnosis | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as StoredDiagnosis;
    return typeof parsed === "object" && parsed ? parsed : null;
  } catch {
    return null;
  }
}

export async function getPilotResultsDashboard(actor: Actor, scope: PilotScope, campaignId?: number) {
  await requirePeopleOpsTenantAccess(actor, scope.tenantId);
  await requirePilot(actor, scope);
  const db = await databaseOrThrow();
  const campaigns = await db.select({
    id: assessmentCampaigns.id,
    title: assessmentCampaigns.title,
    status: assessmentCampaigns.status,
    startAt: assessmentCampaigns.startAt,
    endAt: assessmentCampaigns.endAt,
  }).from(assessmentCampaigns).where(and(eq(assessmentCampaigns.tenantId, scope.tenantId), eq(assessmentCampaigns.pilotId, scope.pilotId))).orderBy(desc(assessmentCampaigns.startAt));

  if (campaignId && !campaigns.some(campaign => campaign.id === campaignId)) {
    throw new TRPCError({ code: "NOT_FOUND", message: "La campaña no pertenece al piloto seleccionado." });
  }

  const conditions = [
    eq(pilotAssessments.tenantId, scope.tenantId),
    eq(pilotAssessments.pilotId, scope.pilotId),
    ...(campaignId ? [eq(pilotAssessments.campaignId, campaignId)] : []),
  ];
  const rows = await db.select({
    assessmentId: pilotAssessments.id,
    campaignId: pilotAssessments.campaignId,
    assessmentState: pilotAssessments.state,
    assignedAt: pilotAssessments.assignedAt,
    submittedAt: pilotAssessments.submittedAt,
    reportCode: pilotParticipants.reportCode,
    roleTitle: pilotParticipants.roleTitle,
    area: pilotParticipants.area,
    campaignTitle: assessmentCampaigns.title,
    campaignStatus: assessmentCampaigns.status,
    diagnosisJson: pilotDiagnoses.resultJson,
    formulaVersion: pilotDiagnoses.formulaVersion,
    calculatedAt: pilotDiagnoses.calculatedAt,
  }).from(pilotAssessments)
    .innerJoin(pilotParticipants, eq(pilotAssessments.participantId, pilotParticipants.id))
    .innerJoin(assessmentCampaigns, eq(pilotAssessments.campaignId, assessmentCampaigns.id))
    .leftJoin(pilotDiagnoses, eq(pilotAssessments.id, pilotDiagnoses.assessmentId))
    .where(and(...conditions))
    .orderBy(desc(pilotAssessments.submittedAt), asc(pilotParticipants.reportCode));

  const records = rows.map(row => {
    const diagnosis = parseStoredDiagnosis(row.diagnosisJson);
    return {
      ...row,
      diagnosis: diagnosis ? {
        overall: diagnosis.overall ?? null,
        coverage: diagnosis.coverage ?? null,
        formula: diagnosis.formula ?? row.formulaVersion ?? "Sin versión",
        dimensions: diagnosis.dimensions ?? [],
      } : null,
    };
  });
  const submitted = records.filter(record => record.assessmentState === "submitted" || record.assessmentState === "locked").length;
  const diagnosed = records.filter(record => record.diagnosis).length;
  const scoreRows = records.filter(record => record.diagnosis?.overall !== null && record.diagnosis?.overall !== undefined);
  const averageOverall = scoreRows.length
    ? Number((scoreRows.reduce((sum, record) => sum + (record.diagnosis?.overall ?? 0), 0) / scoreRows.length).toFixed(2))
    : null;

  return {
    campaigns,
    summary: {
      assigned: records.length,
      submitted,
      diagnosed,
      completionRate: records.length ? Number((submitted / records.length).toFixed(2)) : 0,
      averageOverall,
    },
    records,
  };
}

const csvCell = (value: string | number | null | undefined) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export type PilotResultExportRecord = {
  reportCode: string;
  roleTitle: string;
  area: string | null;
  campaignTitle: string;
  assessmentState: string;
  submittedAt: Date | null;
  diagnosis: { overall: number | null; coverage: number | null; formula: string } | null;
  calculatedAt: Date | null;
};

export function buildPilotResultsCsv(records: PilotResultExportRecord[]) {
  const header = ["Código de reporte", "Rol", "Área", "Campaña", "Estado", "Enviada el", "Puntaje global", "Cobertura", "Fórmula", "Diagnóstico calculado el"];
  const lines = records.map(record => [
    record.reportCode,
    record.roleTitle,
    record.area,
    record.campaignTitle,
    record.assessmentState,
    record.submittedAt?.toISOString() ?? null,
    record.diagnosis?.overall ?? null,
    record.diagnosis?.coverage ?? null,
    record.diagnosis?.formula ?? null,
    record.calculatedAt?.toISOString() ?? null,
  ].map(csvCell).join(","));
  return [header.map(csvCell).join(","), ...lines].join("\n");
}

export async function exportPilotResults(actor: Actor, scope: PilotScope, input: { campaignId?: number; purpose: string }) {
  const dashboard = await getPilotResultsDashboard(actor, scope, input.campaignId);
  await recordAudit(actor, scope, "results.exported", "pilot_results", input.campaignId ? String(input.campaignId) : scope.pilotId, {
    campaignId: input.campaignId ?? "all",
    purpose: input.purpose.trim().slice(0, 240),
    rows: dashboard.records.length,
  });
  return {
    filename: `itti-resultados-${scope.pilotId}-${input.campaignId ?? "todas"}.csv`,
    contentType: "text/csv;charset=utf-8",
    content: buildPilotResultsCsv(dashboard.records),
    rows: dashboard.records.length,
  };
}

type InstrumentDraftInput = {
  title: string;
  description?: string;
  evaluationType: string;
  matrixVersion: string;
  formulaVersion: string;
  instrumentJson: string;
};

async function instrumentDraftForScope(actor: Actor, scope: PilotScope, draftId: string) {
  await requirePeopleOpsTenantAccess(actor, scope.tenantId);
  await requirePilot(actor, scope);
  const db = await databaseOrThrow();
  const [draft] = await db.select().from(pilotInstrumentDrafts).where(eq(pilotInstrumentDrafts.id, draftId)).limit(1);
  if (!draft) throw new TRPCError({ code: "NOT_FOUND", message: "Borrador de instrumento no encontrado." });
  assertSamePilotScope(draft, scope);
  return { db, draft };
}

export async function listPilotInstrumentDrafts(actor: Actor, scope: PilotScope) {
  await requirePeopleOpsTenantAccess(actor, scope.tenantId);
  await requirePilot(actor, scope);
  const db = await databaseOrThrow();
  const drafts = await db.select({
    id: pilotInstrumentDrafts.id,
    title: pilotInstrumentDrafts.title,
    description: pilotInstrumentDrafts.description,
    evaluationType: pilotInstrumentDrafts.evaluationType,
    version: pilotInstrumentDrafts.version,
    state: pilotInstrumentDrafts.state,
    checksum: pilotInstrumentDrafts.checksum,
    reviewNote: pilotInstrumentDrafts.reviewNote,
    updatedAt: pilotInstrumentDrafts.updatedAt,
    submittedForReviewAt: pilotInstrumentDrafts.submittedForReviewAt,
    approvedAt: pilotInstrumentDrafts.approvedAt,
    approvedInstrumentId: pilotInstrumentDrafts.approvedInstrumentId,
  }).from(pilotInstrumentDrafts).where(and(eq(pilotInstrumentDrafts.tenantId, scope.tenantId), eq(pilotInstrumentDrafts.pilotId, scope.pilotId)));
  return drafts.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export async function getPilotInstrumentDraft(actor: Actor, scope: PilotScope, draftId: string) {
  const { draft } = await instrumentDraftForScope(actor, scope, draftId);
  return draft;
}

export async function createPilotInstrumentDraft(actor: Actor, scope: PilotScope, input: InstrumentDraftInput) {
  await requirePeopleOpsTenantAccess(actor, scope.tenantId);
  await requirePilot(actor, scope);
  const title = input.title.trim();
  if (title.length < 4) throw new TRPCError({ code: "BAD_REQUEST", message: "El instrumento necesita un título de al menos cuatro caracteres." });
  validateInstrumentContent(input.instrumentJson);
  const db = await databaseOrThrow();
  const existing = await db.select({ title: pilotInstrumentDrafts.title, version: pilotInstrumentDrafts.version }).from(pilotInstrumentDrafts)
    .where(and(eq(pilotInstrumentDrafts.tenantId, scope.tenantId), eq(pilotInstrumentDrafts.pilotId, scope.pilotId)));
  const nextVersion = Math.max(0, ...existing.filter(item => item.title === title).map(item => item.version)) + 1;
  const id = toId("instrument_draft");
  await db.insert(pilotInstrumentDrafts).values({
    id,
    tenantId: scope.tenantId,
    pilotId: scope.pilotId,
    title,
    description: input.description?.trim() || null,
    evaluationType: input.evaluationType,
    matrixVersion: input.matrixVersion,
    formulaVersion: input.formulaVersion,
    version: nextVersion,
    instrumentJson: input.instrumentJson,
    createdByUserId: actor.id,
    updatedByUserId: actor.id,
  });
  await recordAudit(actor, scope, "instrument.draft_created", "instrument_draft", id, { title, version: nextVersion });
  return { id, version: nextVersion };
}

export async function updatePilotInstrumentDraft(actor: Actor, scope: PilotScope, draftId: string, input: InstrumentDraftInput) {
  const { db, draft } = await instrumentDraftForScope(actor, scope, draftId);
  assertInstrumentDraftAction(draft.state, "update");
  const title = input.title.trim();
  if (title.length < 4) throw new TRPCError({ code: "BAD_REQUEST", message: "El instrumento necesita un título de al menos cuatro caracteres." });
  validateInstrumentContent(input.instrumentJson);
  await db.update(pilotInstrumentDrafts).set({
    title,
    description: input.description?.trim() || null,
    evaluationType: input.evaluationType,
    matrixVersion: input.matrixVersion,
    formulaVersion: input.formulaVersion,
    instrumentJson: input.instrumentJson,
    updatedByUserId: actor.id,
  }).where(eq(pilotInstrumentDrafts.id, draftId));
  await recordAudit(actor, scope, "instrument.draft_updated", "instrument_draft", draftId, { version: draft.version });
  return { id: draftId, version: draft.version };
}

export async function submitPilotInstrumentForReview(actor: Actor, scope: PilotScope, draftId: string, reviewNote?: string) {
  const { db, draft } = await instrumentDraftForScope(actor, scope, draftId);
  assertInstrumentDraftAction(draft.state, "submit_review");
  validateInstrumentContent(draft.instrumentJson);
  const checksum = checksumFor(draft.instrumentJson);
  await db.update(pilotInstrumentDrafts).set({ state: "in_review", checksum, reviewNote: reviewNote?.trim() || null, submittedForReviewAt: new Date(), updatedByUserId: actor.id }).where(eq(pilotInstrumentDrafts.id, draftId));
  await recordAudit(actor, scope, "instrument.review_requested", "instrument_draft", draftId, { checksum, version: draft.version });
  return { id: draftId, checksum };
}

export async function approvePilotInstrumentDraft(actor: Actor, scope: PilotScope, draftId: string, reviewNote?: string) {
  const { db, draft } = await instrumentDraftForScope(actor, scope, draftId);
  assertInstrumentDraftAction(draft.state, "approve");
  validateInstrumentContent(draft.instrumentJson);
  const checksum = checksumFor(draft.instrumentJson);
  const instrumentId = toId("instrument");
  const now = new Date();
  await db.transaction(async tx => {
    await tx.insert(pilotInstruments).values({
      id: instrumentId,
      tenantId: scope.tenantId,
      pilotId: scope.pilotId,
      campaignId: null,
      matrixVersion: draft.matrixVersion,
      formulaVersion: draft.formulaVersion,
      checksum,
      instrumentJson: draft.instrumentJson,
      approvedByUserId: actor.id,
      approvedAt: now,
    });
    await tx.update(pilotInstrumentDrafts).set({
      state: "approved",
      checksum,
      reviewNote: reviewNote?.trim() || draft.reviewNote,
      reviewedByUserId: actor.id,
      approvedAt: now,
      approvedInstrumentId: instrumentId,
      updatedByUserId: actor.id,
    }).where(eq(pilotInstrumentDrafts.id, draftId));
  });
  await recordAudit(actor, scope, "instrument.approved", "instrument", instrumentId, { draftId, checksum, version: draft.version });
  return { draftId, instrumentId, checksum };
}
