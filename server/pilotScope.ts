import { TRPCError } from "@trpc/server";
import type { AccessRole } from "../shared/accessControl";

export type PilotScope = {
  tenantId: string;
  pilotId: string;
};

export type ScopedResource = PilotScope & {
  participantId?: string | null;
};

export type PilotActor = {
  id: number;
  role: AccessRole;
};

export function isSamePilotScope(resource: ScopedResource, scope: PilotScope) {
  return resource.tenantId === scope.tenantId && resource.pilotId === scope.pilotId;
}

export function assertSamePilotScope(resource: ScopedResource, scope: PilotScope) {
  if (!isSamePilotScope(resource, scope)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "El recurso no pertenece al tenant y piloto solicitados." });
  }
}

export function canReadParticipant(actor: PilotActor, participantUserId: number | null, participantId: string, requestedParticipantId?: string) {
  if (actor.role === "admin" || actor.role === "people_ops") return true;
  return participantUserId === actor.id && requestedParticipantId === participantId;
}

export function assertParticipantAccess(actor: PilotActor, participantUserId: number | null, participantId: string, requestedParticipantId?: string) {
  if (!canReadParticipant(actor, participantUserId, participantId, requestedParticipantId)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Solo podés acceder a tu propia evaluación dentro del piloto autorizado." });
  }
}
