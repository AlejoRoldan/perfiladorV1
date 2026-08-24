import { describe, expect, it } from "vitest";
import { buildPilotResultsCsv } from "./pilotRepository";

describe("exportación de resultados persistidos", () => {
  it("incluye únicamente campos mínimos de seguimiento y escapa texto CSV", () => {
    const csv = buildPilotResultsCsv([{
      reportCode: "R-ITTI-01",
      roleTitle: "Analista, People & Culture",
      area: "Talento",
      campaignTitle: "Piloto \"UCorp\"",
      assessmentState: "submitted",
      submittedAt: new Date("2026-08-20T13:00:00.000Z"),
      diagnosis: { overall: 3.25, coverage: 1, formula: "weighted_competency_average_v1" },
      calculatedAt: new Date("2026-08-20T13:05:00.000Z"),
    }]);

    expect(csv).toContain('"Código de reporte"');
    expect(csv).toContain('"R-ITTI-01"');
    expect(csv).toContain('"Analista, People & Culture"');
    expect(csv).toContain('"Piloto ""UCorp"""');
    expect(csv).not.toContain("employeeExternalId");
  });
});
