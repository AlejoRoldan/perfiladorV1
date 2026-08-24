import { describe, expect, it } from "vitest";
import { assertInstrumentDraftAction, validateInstrumentContent } from "./pilotRepository";

const validInstrument = JSON.stringify({
  profileId: "engineer-ssr",
  competencies: [{ id: "delivery", name: "Entrega", expected: 3, weight: 1 }],
  questions: [
    { id: "q1", competencyId: "delivery", prompt: "Entrego resultados observables.", required: true, weight: 1, type: "scale" },
    { id: "q2", competencyId: "delivery", prompt: "Incorporo feedback de forma responsable.", required: true, weight: 1, type: "scale" },
  ],
  scale: { low: "Inicial", middle: "Autónomo", high: "Referente" },
});

describe("ciclo persistente de instrumentos", () => {
  it("acepta un instrumento completo con dos evidencias y escala", () => {
    expect(validateInstrumentContent(validInstrument).questions).toHaveLength(2);
  });

  it("rechaza un instrumento sin la evidencia mínima", () => {
    expect(() => validateInstrumentContent(JSON.stringify({
      profileId: "engineer-ssr", competencies: [{ id: "delivery", name: "Entrega", expected: 3, weight: 1 }],
      questions: [{ id: "q1", competencyId: "delivery", prompt: "Una pregunta", required: true, weight: 1, type: "scale" }],
      scale: { low: "Inicial", middle: "Autónomo", high: "Referente" },
    }))).toThrow("al menos dos preguntas");
  });

  it("bloquea edición y reenvío tras revisión, y exige revisión para aprobar", () => {
    expect(() => assertInstrumentDraftAction("in_review", "update")).toThrow("Solo se pueden editar");
    expect(() => assertInstrumentDraftAction("approved", "submit_review")).toThrow("Solo un borrador");
    expect(() => assertInstrumentDraftAction("draft", "approve")).toThrow("debe estar en revisión");
    expect(() => assertInstrumentDraftAction("in_review", "approve")).not.toThrow();
  });
});
