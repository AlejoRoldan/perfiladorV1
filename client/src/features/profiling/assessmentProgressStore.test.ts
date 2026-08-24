import { describe, expect, it } from "vitest";
import { assessmentProgressKey, clearAssessmentProgress, loadAssessmentProgress, persistAssessmentProgress, type AssessmentProgressStore } from "./assessmentProgressStore";
import { initialDimensions, type PilotSession } from "./pilotDomain";

function createMemoryStore(): AssessmentProgressStore {
  const values = new Map<string, string>();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
}

function activeSession(): PilotSession {
  return {
    id: "session-f1-001",
    name: "Perfilamiento Producto · Piloto F1",
    profilingType: "matriz_capacidades",
    extension: "standard",
    activeFlows: ["values", "competencies"],
    participants: 12,
    state: "active",
    generationStatus: "completed",
    origin: "ai",
    attempt: 1,
    message: "Autoevaluaciones activas.",
    questions: [],
  };
}

describe("persistencia local de H6", () => {
  it("guarda y recupera exactamente las respuestas parciales de una sesión y colaborador", () => {
    const store = createMemoryStore();
    const snapshot = persistAssessmentProgress(store, {
      sessionId: "session-f1-001",
      participantId: "c-001",
      session: activeSession(),
      dimensions: initialDimensions,
      responses: { "q-v-1": 4, "q-c-1": "Usaría evidencia de cliente y riesgo." },
    });

    expect(snapshot).not.toBeNull();
    expect(loadAssessmentProgress(store, "session-f1-001", "c-001")).toMatchObject({
      session: { state: "active" },
      responses: { "q-v-1": 4, "q-c-1": "Usaría evidencia de cliente y riesgo." },
    });
  });

  it("descarta snapshots corruptos o que no pertenecen al contexto actual", () => {
    const store = createMemoryStore();
    const key = assessmentProgressKey("session-f1-001", "c-001");
    store.setItem(key, JSON.stringify({ version: 1, sessionId: "otra-sesion", participantId: "c-001" }));

    expect(loadAssessmentProgress(store, "session-f1-001", "c-001")).toBeNull();
    expect(store.getItem(key)).toBeNull();
  });

  it("elimina el progreso local cuando la autoevaluación se envía", () => {
    const store = createMemoryStore();
    persistAssessmentProgress(store, {
      sessionId: "session-f1-001",
      participantId: "c-001",
      session: activeSession(),
      dimensions: initialDimensions,
      responses: { "q-v-1": 3 },
    });

    expect(clearAssessmentProgress(store, "session-f1-001", "c-001")).toBe(true);
    expect(loadAssessmentProgress(store, "session-f1-001", "c-001")).toBeNull();
  });
});
