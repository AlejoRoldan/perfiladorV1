import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import type { AccessRole } from "../../shared/accessControl";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export function roleProcedure(roles: readonly AccessRole[]) {
  return t.procedure.use(
    t.middleware(async opts => {
      const { ctx, next } = opts;
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
      }
      if (ctx.user.accessStatus !== "active") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Tu acceso todavía no fue aprobado o se encuentra suspendido." });
      }
      if (!roles.includes(ctx.user.role)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tenés permiso para realizar esta acción." });
      }
      return next({ ctx: { ...ctx, user: ctx.user } });
    }),
  );
}

export const peopleOpsProcedure = roleProcedure(["admin", "people_ops"]);

export const adminProcedure = roleProcedure(["admin"]);
