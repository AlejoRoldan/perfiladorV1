import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";
import { assertParticipantAccess, assertSamePilotScope, canReadParticipant, isSamePilotScope } from "./pilotScope";

describe("alcance aislado del Perfilador", () => {
  const scope = { tenantId: "tenant-itti", pilotId: "pilot-f1" };

  it("acepta únicamente recursos del mismo tenant y piloto", () => {
    expect(isSamePilotScope({ ...scope, participantId: "participant-1" }, scope)).toBe(true);
    expect(isSamePilotScope({ tenantId: "tenant-otro", pilotId: "pilot-f1" }, scope)).toBe(false);
    expect(isSamePilotScope({ tenantId: "tenant-itti", pilotId: "pilot-otro" }, scope)).toBe(false);
  });

  it("rechaza una consulta cruzada antes de acceder al repositorio", () => {
    expect(() => assertSamePilotScope({ tenantId: "tenant-otro", pilotId: "pilot-f1" }, scope)).toThrow(TRPCError);
  });

  it("limita a colaboradores y líderes a su propio participante vinculado", () => {
    expect(canReadParticipant({ id: 18, role: "collaborator" }, 18, "participant-1", "participant-1")).toBe(true);
    expect(canReadParticipant({ id: 18, role: "manager" }, 18, "participant-1", "participant-2")).toBe(false);
    expect(() => assertParticipantAccess({ id: 18, role: "collaborator" }, 99, "participant-1", "participant-1")).toThrow(TRPCError);
  });

  it("permite la operación de People & Culture y administración dentro del alcance ya validado", () => {
    expect(canReadParticipant({ id: 7, role: "people_ops" }, null, "participant-1")).toBe(true);
    expect(canReadParticipant({ id: 1, role: "admin" }, null, "participant-1")).toBe(true);
  });
});
