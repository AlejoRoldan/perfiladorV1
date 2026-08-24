import { describe, expect, it } from "vitest";
import { buildLearningPrompt, learningRecommendationInputSchema, learningRecommendationSchema } from "./learningRecommendations";

const input = {
  role: "Analista de datos",
  seniority: "Junior",
  interests: ["Analítica de producto", "Data science"],
  competencies: [
    { name: "Liderazgo", observed: 2, expected: 4 },
    { name: "Análisis de datos", observed: 5, expected: 3 },
  ],
  evidenceCount: 5,
  evaluationStatus: "En evaluación" as const,
};

describe("contrato de recomendación de aprendizaje", () => {
  it("acepta solamente señales mínimas de desarrollo", () => {
    expect(learningRecommendationInputSchema.parse(input)).toEqual(input);
    expect(learningRecommendationInputSchema.safeParse({ ...input, name: "Persona real" }).success).toBe(false);
  });

  it("construye un contexto sin identificadores personales", () => {
    const prompt = buildLearningPrompt(input);
    expect(prompt).toContain("Analista de datos");
    expect(prompt).toContain("Liderazgo");
    expect(prompt).not.toContain("Persona real");
  });

  it("valida una salida limitada a actividades educativas y revisión humana", () => {
    const recommendation = learningRecommendationSchema.parse({
      priority: "Fortalecer liderazgo situacional",
      rationale: "La brecha observada en Liderazgo sugiere practicar la conducción de conversaciones y acuerdos de equipo.",
      activities: [
        { title: "Fundamentos de liderazgo situacional", format: "Curso guiado", objective: "Practicar criterios para adaptar el estilo de liderazgo a cada situación.", duration: "2 semanas" },
        { title: "Conversación acompañada", format: "Acompañamiento", objective: "Ensayar una conversación de prioridades con una persona referente.", duration: "45 minutos" },
      ],
      conversationPrompt: "¿Qué situación real permitiría practicar liderazgo durante las próximas dos semanas?",
      humanReview: "Revisar la propuesta con la persona y People & Culture antes de asignar actividades.",
    });

    expect(recommendation.activities).toHaveLength(2);
    expect(recommendation.priority).toContain("liderazgo");
  });
});
