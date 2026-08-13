import { describe, expect, it } from "vitest";
import { approveReviewedSession, buildDiagnosis, classifyProfileLevel, createDegradedSession, createManualQuestionnaire, createReviewedQuestionnaire, distributeApprovedSession, hasIncompleteResponses, lockAssessmentProgress, PROFILE_TOLERANCE, saveAssessmentProgress, scoreResponse, validateAssessmentSubmission, validateSessionForApproval } from "./pilotEngine";
import { generatedQuestions, initialDimensions, questionsForExtension, type PilotSession } from "./pilotDomain";

describe("motor de perfilamiento F1", () => {
  it("traduce respuestas cerradas y abiertas a la escala común 1–4", () => {
    expect(scoreResponse(5)).toBe(4);
    expect(scoreResponse(true)).toBe(4);
    expect(scoreResponse("Una respuesta con contexto, decisión, evidencia y resultado para el equipo.")).toBe(3);
    expect(scoreResponse(" ")).toBeNull();
  });

  it("respeta la tolerancia de 3 % al clasificar el diagnóstico", () => {
    expect(classifyProfileLevel(2.88, 3)).toBe("acceptable");
    expect(classifyProfileLevel(2.87, 3)).toBe("critical_gap");
    expect(classifyProfileLevel(3.12, 3)).toBe("acceptable");
    expect(classifyProfileLevel(3.13, 3)).toBe("outstanding");
    expect(PROFILE_TOLERANCE).toBe(0.12);
  });

  it("bloquea aprobación si falta un flujo o una rúbrica", () => {
    const session: PilotSession = { id: "s", name: "Piloto", profilingType: "matriz_capacidades", extension: "standard", activeFlows: ["values", "competencies"], participants: 12, state: "in_review", generationStatus: "completed", origin: "ai", attempt: 1, message: "", questions: [{ ...generatedQuestions[0] }, { ...generatedQuestions[1], rubric: "" }] };
    expect(validateSessionForApproval(session).map(item => item.code)).toEqual(["EMPTY_FLOW", "EMPTY_RUBRIC"]);
  });

  it("calcula resultados separados por flujo y detecta respuestas faltantes", () => {
    const responses = { "q-v-1": 4, "q-v-2": "Tomaría contexto, escucharía a las partes, explicaría el cambio y verificaría acuerdos para cuidar al equipo.", "q-c-1": "Usaría impacto, costo de demora, señal de cliente y riesgo operativo para priorizar con evidencia disponible.", "q-c-2": 4 };
    const diagnosis = buildDiagnosis(generatedQuestions, initialDimensions.filter(dimension => ["v-integrity", "v-collaboration", "c-strategy", "c-communication"].includes(dimension.id)), responses);
    expect(diagnosis.flows.find(flow => flow.flow === "values")?.dimensions).toHaveLength(2);
    expect(diagnosis.dimensions.every(item => item.actual >= 1 && item.actual <= 4)).toBe(true);
    expect(hasIncompleteResponses(generatedQuestions, { "q-v-1": 4 })).toBe(true);
  });

  it("compone preguntas según la extensión aprobada", () => {
    expect(questionsForExtension("rapid", ["values", "competencies"])).toHaveLength(5);
    expect(questionsForExtension("standard", ["values", "competencies"])).toHaveLength(10);
    expect(questionsForExtension("deep", ["values", "competencies"])).toHaveLength(15);
  });

  it("diagnostica únicamente los flujos incluidos en la sesión", () => {
    const valueQuestions = generatedQuestions.filter(question => question.flow === "values");
    const responses = Object.fromEntries(valueQuestions.map(question => [question.id, 4]));
    const diagnosis = buildDiagnosis(valueQuestions, initialDimensions, responses);

    expect(diagnosis.flows.map(flow => flow.flow)).toEqual(["values"]);
    expect(diagnosis.dimensions.every(dimension => dimension.flow === "values")).toBe(true);
  });

  it("ofrece fallback degradado y conserva la revisión humana al aplicar una plantilla o cuestionario manual", () => {
    const draft: PilotSession = { id: "s-fallback", name: "Piloto", profilingType: "matriz_capacidades", extension: "rapid", activeFlows: ["values", "competencies"], participants: 12, state: "generating", generationStatus: "running", origin: "ai", attempt: 1, message: "", questions: [] };
    const degraded = createDegradedSession(draft);
    const template = createReviewedQuestionnaire(degraded, "template", generatedQuestions.slice(0, 5));
    const manual = createManualQuestionnaire(degraded);

    expect(degraded.state).toBe("generation_degraded");
    expect(template).toMatchObject({ state: "in_review", origin: "template", generationStatus: "completed" });
    expect(manual).toMatchObject({ state: "in_review", origin: "manual", questions: [] });
  });

  it("solo aprueba una sesión revisada y válida antes de distribuirla", () => {
    const reviewed: PilotSession = { id: "s-hitl", name: "Piloto", profilingType: "matriz_capacidades", extension: "rapid", activeFlows: ["values", "competencies"], participants: 12, state: "in_review", generationStatus: "completed", origin: "template", attempt: 1, message: "", questions: [generatedQuestions[0], generatedQuestions[2]] };
    const approval = approveReviewedSession(reviewed);

    expect(approval.ok).toBe(true);
    if (!approval.ok) return;
    expect(approval.session.state).toBe("approved");
    expect(distributeApprovedSession(approval.session)).toMatchObject({ ok: true, session: { state: "active" } });
    expect(distributeApprovedSession(reviewed)).toEqual({ ok: false, code: "SESSION_NOT_APPROVED" });
  });

  it("guarda progreso retomable y bloquea el envío incompleto o fuera de una sesión activa", () => {
    const active: PilotSession = { id: "s-h6", name: "Piloto", profilingType: "matriz_capacidades", extension: "rapid", activeFlows: ["values"], participants: 1, state: "active", generationStatus: "completed", origin: "template", attempt: 1, message: "", questions: [generatedQuestions[0]] };
    const progress = saveAssessmentProgress({}, generatedQuestions[0].id, 4);
    const locked = lockAssessmentProgress(progress);

    expect(progress).toEqual({ "q-v-1": 4 });
    expect(Object.isFrozen(locked)).toBe(true);
    expect(saveAssessmentProgress(progress, generatedQuestions[0].id, 1, true)).toBe(progress);
    expect(validateAssessmentSubmission(active, active.questions, progress)).toEqual({ ok: true });
    expect(validateAssessmentSubmission({ ...active, state: "approved" }, active.questions, progress)).toEqual({ ok: false, code: "SESSION_NOT_ACTIVE" });
    expect(validateAssessmentSubmission(active, [...active.questions, generatedQuestions[1]], progress)).toEqual({ ok: false, code: "INCOMPLETE_ASSESSMENT" });
  });
});
