import { describe, expect, it } from "vitest";
import { getPipelineState } from "./PilotSessionsPanel";
import type { PilotSession } from "./pilotDomain";

function sessionWith(state: PilotSession["state"]): PilotSession {
  return {
    id: "session-test",
    name: "Sesión de prueba",
    profilingType: "engineering_self_assessment",
    extension: "standard",
    activeFlows: ["values", "competencies"],
    participants: 1,
    state,
    generationStatus: "pending",
    origin: "manual",
    attempt: 0,
    message: "Estado de prueba",
    questions: [],
  };
}

describe("pipeline visible de Sesiones", () => {
  it("traduce estados de dominio al lenguaje del mockup", () => {
    expect(getPipelineState(sessionWith("draft"), false)).toBe("Borrador");
    expect(getPipelineState(sessionWith("generating"), false)).toBe("Generando");
    expect(getPipelineState(sessionWith("in_review"), false)).toBe("En revisión");
    expect(getPipelineState(sessionWith("active"), false)).toBe("Distribuida");
    expect(getPipelineState(sessionWith("closed"), false)).toBe("Vencida");
  });

  it("prioriza la finalización de la autoevaluación como sesión completada", () => {
    expect(getPipelineState(sessionWith("active"), true)).toBe("Completada");
  });
});
