import { describe, expect, it } from "vitest";
import { assessmentTemplates, competencies, demoEmployees, opportunities } from "./talentDemo";

describe("datos demostrativos", () => {
  it("incluye un conjunto suficiente y claramente sintético para recorrer el MVP", () => {
    expect(demoEmployees).toHaveLength(80);
    expect(competencies).toHaveLength(29);
    expect(assessmentTemplates).toHaveLength(8);
    expect(competencies.slice(0, 4).map(item => item.domain)).toEqual(["Engineering · Matriz Itti", "Engineering · Matriz Itti", "Engineering · Matriz Itti", "Engineering · Matriz Itti"]);
    expect(opportunities).toHaveLength(10);
    expect(demoEmployees.every(employee => employee.name.length > 3 && employee.skills["Comunicación"] !== undefined)).toBe(true);
  });
});
