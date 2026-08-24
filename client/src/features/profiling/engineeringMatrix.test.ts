import { describe, expect, it } from "vitest";
import { dimensionsForEngineeringProfile, engineeringCompetencies, engineeringEvaluationTypes, engineeringProfiles, questionsForEngineeringProfile } from "./engineeringMatrix";

describe("matriz oficial de Engineering de Itti", () => {
  it("preserva las cuatro competencias y los cinco perfiles provistos por People & Culture", () => {
    expect(engineeringCompetencies.map(item => item.name)).toEqual([
      "Fundamentos técnicos y operativos",
      "Dominio y visión",
      "Ownership y mentoring",
      "Comunicación y liderazgo",
    ]);
    expect(engineeringProfiles.map(profile => profile.id)).toEqual([
      "engineer-jr",
      "engineer-ssr",
      "engineer-sr",
      "technical-lead",
      "engineering-manager",
    ]);
  });

  it("normaliza la progresión acumulativa de Engineering a la escala F1 sin tocar los valores demo", () => {
    const dimensions = dimensionsForEngineeringProfile("engineer-sr");
    expect(dimensions.filter(item => item.flow === "values").every(item => item.source === "weel_export")).toBe(true);
    expect(dimensions.filter(item => item.flow === "competencies")).toMatchObject([
      { id: "eng-foundations", expected: 3, source: "itti_engineering_matrix" },
      { id: "eng-domain", expected: 3, source: "itti_engineering_matrix" },
      { id: "eng-ownership", expected: 3, source: "itti_engineering_matrix" },
      { id: "eng-communication", expected: 3, source: "itti_engineering_matrix" },
    ]);
  });

  it("compone instrumentos revisables para los tres tipos de evaluación derivados", () => {
    expect(engineeringEvaluationTypes).toHaveLength(3);
    const questions = questionsForEngineeringProfile("engineering-manager", "standard", ["values", "competencies"]);
    expect(questions).toHaveLength(10);
    expect(questions.some(question => question.dimensionId === "eng-foundations")).toBe(true);
    expect(questions.some(question => question.flow === "values")).toBe(true);
  });
});
