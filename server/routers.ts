import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { learningRecommendationInputSchema, recommendLearningPath } from "./learningRecommendations";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Demo pública con datos sintéticos. En producción, sustituir por protected/adminProcedure
  // y aplicar autorización, auditoría y aislamiento por tenant del lado del servidor.
  learning: router({
    recommend: publicProcedure.input(learningRecommendationInputSchema).mutation(async ({ input }) => {
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

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
