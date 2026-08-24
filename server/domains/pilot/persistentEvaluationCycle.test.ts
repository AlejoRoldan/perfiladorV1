import { describe, expect, it } from "vitest";
import { buildDeterministicDiagnosis, validateInstrumentContent } from "./pilotRepository";

const instrument = validateInstrumentContent(JSON.stringify({
  profileId: "engineer-ssr",
  competencies: [
    { id: "delivery", name: "Entrega", expected: 3, weight: 2 },
    { id: "quality", name: "Calidad", expected: 4, weight: 1 },
  ],
  questions: [
    { id: "q-delivery", competencyId: "delivery", prompt: "Entrega resultados", required: true, weight: 1, type: "scale" },
    { id: "q-quality", competencyId: "quality", prompt: "Cuida la calidad", required: true, weight: 1, type: "scale" },
  ],
  scale: { low: "Inicial", middle: "Autónomo", high: "Referente" },
}));

describe("diagnóstico persistente de evaluación", () => {
  it("calcula puntaje ponderado, brechas y cobertura sin depender del cliente", () => {
    const diagnosis = buildDeterministicDiagnosis(instrument, [
      { questionId: "q-delivery", scoredValue: 3 },
      { questionId: "q-quality", scoredValue: 2 },
    ]);
    expect(diagnosis.overall).toBe(2.67);
    expect(diagnosis.coverage).toBe(1);
    expect(diagnosis.dimensions).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "delivery", observed: 3, gap: 0 }),
      expect.objectContaining({ id: "quality", observed: 2, gap: 2 }),
    ]));
  });
});
