import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { learningRecommendationInputSchema, recommendLearningPath } from "./learningRecommendations";
import { adminProcedure, peopleOpsProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { accessRoles, accessStatuses } from "../shared/accessControl";
import { listPlatformUsers, updatePlatformUserAccess } from "./db";
import { buildSyntheticReportExport } from "./reportExports";
import {
  addPilotParticipant,
  approvePilotInstrumentDraft,
  assignCampaignToParticipants,
  assignPilotAssessment,
  buildDeterministicDiagnosis,
  calculatePilotDiagnosis,
  createCampaignFromApprovedInstrument,
  createPilotInstrumentDraft,
  createRealPilotWorkspace,
  createScopedCampaign,
  exportPilotResults,
  getPilotInstrumentDraft,
  getPilotResultsDashboard,
  getPilotWorkspace,
  listAccessiblePilots,
  listCampaignAssignments,
  listEligibleParticipantUsers,
  listPilotInstrumentDrafts,
  listOwnAssignedAssessments,
  saveOwnAssessmentAnswers,
  savePilotDiagnosis,
  submitPilotInstrumentForReview,
  submitOwnAssessment,
  updatePilotInstrumentDraft,
} from "./pilotRepository";
import { z } from "zod";
import {
  createCampaign,
  getCampaignById,
  getCampaignStatusAt,
  listCampaignSummaries,
  updateCampaignStatus,
} from "./campaigns";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: protectedProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  learning: router({
    recommend: protectedProcedure.input(learningRecommendationInputSchema).mutation(async ({ input }) => {
      try {
        return await recommendLearningPath(input);
      } catch (error) {
        console.error("[Learning recommendation] Servicio no disponible", error instanceof Error ? error.message : "error desconocido");
        throw new TRPCError({
          code: "SERVICE_UNAVAILABLE",
          message: "No fue posible generar la ruta de capacitación. Intenta nuevamente más tarde.",
        });
      }
    }),
  }),

  campaigns: router({
    list: peopleOpsProcedure.query(async () => listCampaignSummaries()),
    create: peopleOpsProcedure.input(z.object({
      title: z.string().trim().min(3).max(180),
      templateId: z.string().min(1).max(100),
      templateName: z.string().min(1).max(220),
      startAt: z.coerce.date(),
      endAt: z.coerce.date(),
      timezone: z.literal("America/Asuncion"),
      participants: z.array(z.object({
        employeeId: z.string().min(1).max(100),
        employeeName: z.string().min(1).max(180),
        employeeRole: z.string().min(1).max(180),
      })).min(1).max(80),
    })).mutation(async ({ input }) => {
      const campaign = await createCampaign(input);
      return { campaignId: campaign.id, nextReminderAt: campaign.nextReminderAt ?? null };
    }),
    setStatus: peopleOpsProcedure.input(z.object({
      campaignId: z.number().int().positive(),
      status: z.enum(["active", "paused", "closed"]),
    })).mutation(async ({ input }) => {
      const campaign = await getCampaignById(input.campaignId);
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND", message: "Campaña no encontrada." });
      const resolvedStatus = input.status === "active"
        ? getCampaignStatusAt({ startAt: campaign.startAt, endAt: campaign.endAt, status: "scheduled" }, new Date())
        : input.status;
      await updateCampaignStatus(campaign.id, resolvedStatus);
      return { success: true, status: resolvedStatus };
    }),
  }),

  access: router({
    listUsers: adminProcedure.query(async () => listPlatformUsers()),
    updateUser: adminProcedure.input(z.object({
      openId: z.string().min(1).max(64),
      role: z.enum(accessRoles),
      accessStatus: z.enum(accessStatuses),
    })).mutation(async ({ ctx, input }) => {
      if (input.openId === ctx.user.openId && (input.role !== "admin" || input.accessStatus !== "active")) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No podés retirar tu propio acceso administrativo activo." });
      }
      const user = await updatePlatformUserAccess(input.openId, input.role, input.accessStatus);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "Usuario no encontrado." });
      return user;
    }),
  }),

  reports: router({
    exportSummary: adminProcedure.mutation(() => buildSyntheticReportExport()),
  }),

  pilot: router({
    listAccessible: protectedProcedure.query(({ ctx }) => listAccessiblePilots(ctx.user)),
    workspace: protectedProcedure.input(z.object({ tenantId: z.string().min(1).max(64), pilotId: z.string().min(1).max(64) }))
      .query(({ ctx, input }) => getPilotWorkspace(ctx.user, input)),
    bootstrap: adminProcedure.input(z.object({
      tenantCode: z.string().trim().regex(/^[a-z0-9-]+$/).min(3).max(64),
      tenantName: z.string().trim().min(3).max(180),
      pilotCode: z.string().trim().regex(/^[a-z0-9-]+$/).min(3).max(64),
      pilotName: z.string().trim().min(3).max(180),
      retentionUntil: z.coerce.date().optional(),
    })).mutation(({ ctx, input }) => createRealPilotWorkspace(ctx.user, input)),
    addParticipant: peopleOpsProcedure.input(z.object({
      tenantId: z.string().min(1).max(64), pilotId: z.string().min(1).max(64),
      employeeExternalId: z.string().trim().min(2).max(100), displayName: z.string().trim().min(2).max(180), roleTitle: z.string().trim().min(2).max(180),
      seniority: z.string().trim().max(64).optional(), area: z.string().trim().max(120).optional(), squad: z.string().trim().max(120).optional(), linkedUserId: z.number().int().positive().nullable().optional(),
    })).mutation(({ ctx, input }) => {
      const { tenantId, pilotId, ...participant } = input;
      return addPilotParticipant(ctx.user, { tenantId, pilotId }, participant);
    }),
    listEligibleUsers: peopleOpsProcedure.input(z.object({ tenantId: z.string().min(1).max(64) }))
      .query(({ ctx, input }) => listEligibleParticipantUsers(ctx.user, input.tenantId)),
    createCampaign: peopleOpsProcedure.input(z.object({
      tenantId: z.string().min(1).max(64), pilotId: z.string().min(1).max(64), title: z.string().trim().min(3).max(180),
      templateId: z.string().trim().min(1).max(100), templateName: z.string().trim().min(1).max(220), startAt: z.coerce.date(), endAt: z.coerce.date(), timezone: z.literal("America/Asuncion"),
    })).mutation(({ ctx, input }) => {
      const { tenantId, pilotId, ...campaign } = input;
      return createScopedCampaign(ctx.user, { tenantId, pilotId }, campaign);
    }),
    createCampaignFromInstrument: peopleOpsProcedure.input(z.object({
      tenantId: z.string().min(1).max(64), pilotId: z.string().min(1).max(64), title: z.string().trim().min(3).max(180), instrumentId: z.string().min(1).max(64), startAt: z.coerce.date(), endAt: z.coerce.date(), timezone: z.literal("America/Asuncion"),
    })).mutation(({ ctx, input }) => {
      const { tenantId, pilotId, ...campaign } = input;
      return createCampaignFromApprovedInstrument(ctx.user, { tenantId, pilotId }, campaign);
    }),
    listInstrumentDrafts: peopleOpsProcedure.input(z.object({ tenantId: z.string().min(1).max(64), pilotId: z.string().min(1).max(64) }))
      .query(({ ctx, input }) => listPilotInstrumentDrafts(ctx.user, input)),
    getInstrumentDraft: peopleOpsProcedure.input(z.object({ tenantId: z.string().min(1).max(64), pilotId: z.string().min(1).max(64), draftId: z.string().min(1).max(64) }))
      .query(({ ctx, input }) => getPilotInstrumentDraft(ctx.user, { tenantId: input.tenantId, pilotId: input.pilotId }, input.draftId)),
    createInstrumentDraft: peopleOpsProcedure.input(z.object({
      tenantId: z.string().min(1).max(64), pilotId: z.string().min(1).max(64), title: z.string().trim().min(4).max(180), description: z.string().trim().max(500).optional(),
      evaluationType: z.string().trim().min(1).max(100), matrixVersion: z.string().trim().min(1).max(100), formulaVersion: z.string().trim().min(1).max(100), instrumentJson: z.string().min(2).max(100_000),
    })).mutation(({ ctx, input }) => {
      const { tenantId, pilotId, ...draft } = input;
      return createPilotInstrumentDraft(ctx.user, { tenantId, pilotId }, draft);
    }),
    updateInstrumentDraft: peopleOpsProcedure.input(z.object({
      tenantId: z.string().min(1).max(64), pilotId: z.string().min(1).max(64), draftId: z.string().min(1).max(64), title: z.string().trim().min(4).max(180), description: z.string().trim().max(500).optional(),
      evaluationType: z.string().trim().min(1).max(100), matrixVersion: z.string().trim().min(1).max(100), formulaVersion: z.string().trim().min(1).max(100), instrumentJson: z.string().min(2).max(100_000),
    })).mutation(({ ctx, input }) => {
      const { tenantId, pilotId, draftId, ...draft } = input;
      return updatePilotInstrumentDraft(ctx.user, { tenantId, pilotId }, draftId, draft);
    }),
    submitInstrumentReview: peopleOpsProcedure.input(z.object({ tenantId: z.string().min(1).max(64), pilotId: z.string().min(1).max(64), draftId: z.string().min(1).max(64), reviewNote: z.string().trim().max(500).optional() }))
      .mutation(({ ctx, input }) => submitPilotInstrumentForReview(ctx.user, { tenantId: input.tenantId, pilotId: input.pilotId }, input.draftId, input.reviewNote)),
    approveInstrumentDraft: peopleOpsProcedure.input(z.object({ tenantId: z.string().min(1).max(64), pilotId: z.string().min(1).max(64), draftId: z.string().min(1).max(64), reviewNote: z.string().trim().max(500).optional() }))
      .mutation(({ ctx, input }) => approvePilotInstrumentDraft(ctx.user, { tenantId: input.tenantId, pilotId: input.pilotId }, input.draftId, input.reviewNote)),
    assignAssessment: peopleOpsProcedure.input(z.object({
      tenantId: z.string().min(1).max(64), pilotId: z.string().min(1).max(64), campaignId: z.number().int().positive(), instrumentId: z.string().min(1).max(64), participantId: z.string().min(1).max(64),
    })).mutation(({ ctx, input }) => {
      const { tenantId, pilotId, ...assignment } = input;
      return assignPilotAssessment(ctx.user, { tenantId, pilotId }, assignment);
    }),
    assignCampaignParticipants: peopleOpsProcedure.input(z.object({ tenantId: z.string().min(1).max(64), pilotId: z.string().min(1).max(64), campaignId: z.number().int().positive() }))
      .mutation(({ ctx, input }) => assignCampaignToParticipants(ctx.user, { tenantId: input.tenantId, pilotId: input.pilotId }, input.campaignId)),
    listCampaignAssignments: peopleOpsProcedure.input(z.object({ tenantId: z.string().min(1).max(64), pilotId: z.string().min(1).max(64), campaignId: z.number().int().positive() }))
      .query(({ ctx, input }) => listCampaignAssignments(ctx.user, { tenantId: input.tenantId, pilotId: input.pilotId }, input.campaignId)),
    myAssessments: protectedProcedure.input(z.object({ tenantId: z.string().min(1).max(64), pilotId: z.string().min(1).max(64) }))
      .query(({ ctx, input }) => listOwnAssignedAssessments(ctx.user, input)),
    saveOwnAnswers: protectedProcedure.input(z.object({
      tenantId: z.string().min(1).max(64), pilotId: z.string().min(1).max(64), assessmentId: z.string().min(1).max(64), participantId: z.string().min(1).max(64),
      answers: z.array(z.object({ questionId: z.string().min(1).max(100), flow: z.enum(["values", "competencies"]), responseJson: z.string().min(1), scoredValue: z.number().int().min(1).max(4).nullable().optional() })).min(1).max(80),
    })).mutation(({ ctx, input }) => {
      const { tenantId, pilotId, ...answers } = input;
      return saveOwnAssessmentAnswers(ctx.user, { tenantId, pilotId }, answers);
    }),
    submitOwnAssessment: protectedProcedure.input(z.object({ tenantId: z.string().min(1).max(64), pilotId: z.string().min(1).max(64), assessmentId: z.string().min(1).max(64), participantId: z.string().min(1).max(64) }))
      .mutation(({ ctx, input }) => {
        const { tenantId, pilotId, ...assessment } = input;
        return submitOwnAssessment(ctx.user, { tenantId, pilotId }, assessment);
      }),
    saveDiagnosis: peopleOpsProcedure.input(z.object({ tenantId: z.string().min(1).max(64), pilotId: z.string().min(1).max(64), assessmentId: z.string().min(1).max(64), formulaVersion: z.string().trim().min(1).max(100), resultJson: z.string().min(2) }))
      .mutation(({ ctx, input }) => {
        const { tenantId, pilotId, ...diagnosis } = input;
        return savePilotDiagnosis(ctx.user, { tenantId, pilotId }, diagnosis);
      }),
    calculateDiagnosis: peopleOpsProcedure.input(z.object({ tenantId: z.string().min(1).max(64), pilotId: z.string().min(1).max(64), assessmentId: z.string().min(1).max(64) }))
      .mutation(({ ctx, input }) => calculatePilotDiagnosis(ctx.user, { tenantId: input.tenantId, pilotId: input.pilotId }, input.assessmentId)),
    resultsDashboard: peopleOpsProcedure.input(z.object({ tenantId: z.string().min(1).max(64), pilotId: z.string().min(1).max(64), campaignId: z.number().int().positive().optional() }))
      .query(({ ctx, input }) => getPilotResultsDashboard(ctx.user, { tenantId: input.tenantId, pilotId: input.pilotId }, input.campaignId)),
    exportResults: peopleOpsProcedure.input(z.object({ tenantId: z.string().min(1).max(64), pilotId: z.string().min(1).max(64), campaignId: z.number().int().positive().optional(), purpose: z.string().trim().min(8).max(240) }))
      .mutation(({ ctx, input }) => exportPilotResults(ctx.user, { tenantId: input.tenantId, pilotId: input.pilotId }, { campaignId: input.campaignId, purpose: input.purpose })),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
