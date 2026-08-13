import { describe, expect, it } from "vitest";
import { profilingOpenApi } from "./openapi";

describe("contrato OpenAPI del perfilador", () => {
  it("expone los estados y orígenes completos del dominio", () => {
    const session = profilingOpenApi.components.schemas.ProfilingSession.properties;
    expect(session.state.enum).toEqual(["draft", "generating", "in_review", "generation_degraded", "generation_failed", "approved", "active", "closed"]);
    expect(session.generation_status.enum).toEqual(["pending", "running", "completed", "degraded", "failed"]);
    expect(session.questionnaire_origin.enum).toEqual(["ai", "template", "manual"]);
  });

  it("documenta modo demo sin autenticación y el recorrido H2–H7", () => {
    expect(profilingOpenApi.security).toEqual([]);
    expect(profilingOpenApi.paths["/sessions"]).toBeDefined();
    expect(profilingOpenApi.paths["/assessments/{id}/submit"]).toBeDefined();
    expect(profilingOpenApi.paths["/diagnosis/{assessment_id}"]).toBeDefined();
  });
});
