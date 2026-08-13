import { describe, expect, it } from "vitest";
import { calculateGap, calculateRoleMatch, calculateWeightedScore, normalizeScore } from "./talentEngine";

describe("motor de talento", () => {
  it("normaliza una escala de dominio de forma acotada", () => {
    expect(normalizeScore(1)).toBe(0);
    expect(normalizeScore(5)).toBe(100);
    expect(normalizeScore(8)).toBe(100);
  });

  it("calcula una ponderación sin usar respuestas ausentes", () => {
    expect(calculateWeightedScore([{ score: 4, weight: 2 }, { score: 2, weight: 1 }, { score: null, weight: 4 }])).toBe(3.33);
    expect(calculateWeightedScore([{ score: null, weight: 1 }])).toBeNull();
  });

  it("explica compatibilidad y brechas sin tomar una decisión automática", () => {
    const result = calculateRoleMatch({
      requiredSkills: { "Pensamiento estratégico": 4, Comunicación: 3 },
      desiredSkills: { Liderazgo: 4 },
      employeeSkills: { "Pensamiento estratégico": 4, Comunicación: 2, Liderazgo: 4 },
    });
    expect(calculateGap(2, 4)).toBe(2);
    expect(result.score).toBe(60);
    expect(result.missing).toHaveLength(1);
    expect(result.explanation).toContain("Comunicación");
  });
});
