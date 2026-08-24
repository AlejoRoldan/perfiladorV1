export const profilingOpenApi = {
  openapi: "3.0.3",
  info: {
    title: "Perfilador UCorp API — Demo F1",
    version: "0.1.0-demo",
    description: "Contrato REST del Perfilador UCorp. H1 de autenticación está excluida del piloto: estas rutas se documentan sin seguridad operativa y quedan preparadas para Bearer JWT/Okta.",
  },
  servers: [{ url: "/api/v1", description: "Servidor de demo standalone" }],
  paths: {
    "/openapi.json": { get: { summary: "Contrato OpenAPI del piloto", responses: { "200": { description: "Especificación OpenAPI 3.x" } } } },
    "/values": { get: { summary: "Listar valores configurados", responses: { "200": { description: "Valores y niveles esperados" } } } },
    "/competencies": { get: { summary: "Listar competencias configuradas", responses: { "200": { description: "Competencias y niveles esperados" } } } },
    "/sessions": { post: { summary: "Crear sesión de perfilamiento", responses: { "201": { description: "Sesión en draft" }, "422": { description: "Configuración inválida", content: { "application/problem+json": { schema: { $ref: "#/components/schemas/Problem" } } } } } } },
    "/sessions/{id}/state": { get: { summary: "Consultar estado de una sesión", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Estado de sesión", content: { "application/json": { schema: { $ref: "#/components/schemas/ProfilingSession" } } } } } } },
    "/sessions/{id}/hitl/questions/{qid}": { patch: { summary: "Editar pregunta en HITL", responses: { "200": { description: "Pregunta actualizada" }, "409": { description: "SESSION_NOT_EDITABLE", content: { "application/problem+json": { schema: { $ref: "#/components/schemas/Problem" } } } }, "422": { description: "EMPTY_RUBRIC", content: { "application/problem+json": { schema: { $ref: "#/components/schemas/Problem" } } } } } } },
    "/sessions/{id}/hitl/approve": { post: { summary: "Aprobar cuestionario", responses: { "200": { description: "Sesión approved" }, "422": { description: "EMPTY_FLOW o EMPTY_RUBRIC", content: { "application/problem+json": { schema: { $ref: "#/components/schemas/Problem" } } } } } } },
    "/sessions/{id}/distribute": { post: { summary: "Distribuir sesión aprobada", responses: { "202": { description: "Sesión active y assessments creados" }, "409": { description: "SESSION_NOT_APPROVED", content: { "application/problem+json": { schema: { $ref: "#/components/schemas/Problem" } } } } } } },
    "/assessments/{id}": { get: { summary: "Obtener autoevaluación", responses: { "200": { description: "Assessment y progreso" } } }, put: { summary: "Guardar progreso de autoevaluación", responses: { "200": { description: "Progreso guardado" }, "409": { description: "ASSESSMENT_ALREADY_SUBMITTED" } } } },
    "/assessments/{id}/submit": { post: { summary: "Enviar autoevaluación", responses: { "200": { description: "Assessment submitted; scoring pending" }, "409": { description: "ASSESSMENT_ALREADY_SUBMITTED" }, "422": { description: "INCOMPLETE_ASSESSMENT" } } } },
    "/diagnosis/{assessment_id}": { get: { summary: "Consultar diagnóstico individual", responses: { "200": { description: "Gaps por flujo y chart_payload" }, "404": { description: "DIAGNOSIS_NOT_READY" } } } },
  },
  components: {
    securitySchemes: { futureBearerJwt: { type: "http", scheme: "bearer", bearerFormat: "JWT", description: "Esquema reservado para la futura integración de H1/Okta; no está activo en la demo." } },
    schemas: {
      ProfilingSession: { type: "object", required: ["id", "state", "generation_status"], properties: { id: { type: "string" }, state: { type: "string", enum: ["draft", "generating", "in_review", "generation_degraded", "generation_failed", "approved", "active", "closed"] }, generation_status: { type: "string", enum: ["pending", "running", "completed", "degraded", "failed"] }, questionnaire_origin: { type: "string", enum: ["ai", "template", "manual"] } } },
      Problem: { type: "object", required: ["code", "detail"], properties: { code: { type: "string", example: "EMPTY_FLOW" }, detail: { type: "string" }, status: { type: "integer" } } },
    },
  },
  security: [],
} as const;
