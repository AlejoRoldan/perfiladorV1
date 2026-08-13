import type { DiagnosisStatus, PilotDimension, PilotQuestion, PilotSession, ProfilingFlow } from "./pilotDomain";

export const PROFILE_TOLERANCE = 0.12;

export function scoreResponse(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(1, Math.min(4, value));
  if (typeof value === "boolean") return value ? 4 : 1;
  if (typeof value === "string") {
    const length = value.trim().length;
    if (!length) return null;
    if (length >= 110) return 4;
    if (length >= 55) return 3;
    if (length >= 18) return 2;
    return 1;
  }
  return null;
}

export function classifyProfileLevel(actual: number, expected: number, tolerance = PROFILE_TOLERANCE): DiagnosisStatus {
  if (actual < expected - tolerance) return "critical_gap";
  if (actual > expected + tolerance) return "outstanding";
  return "acceptable";
}

export function validateSessionForApproval(session: PilotSession) {
  const errors: Array<{ code: "EMPTY_FLOW" | "EMPTY_RUBRIC"; detail: string }> = [];
  session.activeFlows.forEach(flow => {
    if (!session.questions.some(question => question.flow === flow)) errors.push({ code: "EMPTY_FLOW", detail: `El flujo ${flow === "values" ? "Valores" : "Competencias"} requiere al menos una pregunta.` });
  });
  session.questions.forEach(question => {
    if (question.type === "practical_scenario" && !question.rubric?.trim()) errors.push({ code: "EMPTY_RUBRIC", detail: "Cada escenario práctico requiere una rúbrica no vacía." });
  });
  return errors;
}

export function hasIncompleteResponses(questions: PilotQuestion[], responses: Record<string, unknown>) {
  return questions.some(question => question.required && scoreResponse(responses[question.id]) === null);
}

export function createDegradedSession(session: PilotSession): PilotSession {
  return { ...session, state: "generation_degraded", generationStatus: "degraded", message: "El motor no está disponible. Elegí plantilla local, cuestionario manual o reintento." };
}

export function createReviewedQuestionnaire(session: PilotSession, origin: "ai" | "template", questions: PilotQuestion[]): PilotSession {
  return {
    ...session,
    state: "in_review",
    generationStatus: "completed",
    origin,
    questions,
    message: `${origin === "ai" ? "Borrador generado" : "Plantilla matriz v5 aplicada"} con ${questions.length} preguntas. Requiere revisión humana antes de distribuir.`,
  };
}

export function createManualQuestionnaire(session: PilotSession): PilotSession {
  return { ...session, state: "in_review", generationStatus: "completed", origin: "manual", questions: [], message: "Cuestionario manual creado vacío. Agregá al menos una pregunta por flujo activo." };
}

export type ApprovalResult =
  | { ok: true; session: PilotSession }
  | { ok: false; code: "SESSION_NOT_IN_REVIEW" | "SESSION_INVALID"; errors: ReturnType<typeof validateSessionForApproval> };

export function approveReviewedSession(session: PilotSession): ApprovalResult {
  if (session.state !== "in_review") return { ok: false, code: "SESSION_NOT_IN_REVIEW", errors: [] };
  const errors = validateSessionForApproval(session);
  if (errors.length) return { ok: false, code: "SESSION_INVALID", errors };
  return { ok: true, session: { ...session, state: "approved", message: "Cuestionario aprobado. Puede distribuirse a los participantes de la demo." } };
}

export type DistributionResult =
  | { ok: true; session: PilotSession }
  | { ok: false; code: "SESSION_NOT_APPROVED" };

export function distributeApprovedSession(session: PilotSession): DistributionResult {
  if (session.state !== "approved") return { ok: false, code: "SESSION_NOT_APPROVED" };
  return { ok: true, session: { ...session, state: "active", message: `${session.participants} autoevaluaciones demo fueron creadas y están activas.` } };
}

export function saveAssessmentProgress(current: Record<string, unknown>, questionId: string, value: unknown, submitted = false) {
  if (submitted) return current;
  return { ...current, [questionId]: value };
}

export function lockAssessmentProgress(current: Record<string, unknown>) {
  return Object.freeze({ ...current });
}

export type AssessmentSubmissionResult = { ok: true } | { ok: false; code: "SESSION_NOT_ACTIVE" | "INCOMPLETE_ASSESSMENT" };

export function validateAssessmentSubmission(session: PilotSession, questions: PilotQuestion[], responses: Record<string, unknown>): AssessmentSubmissionResult {
  if (session.state !== "active") return { ok: false, code: "SESSION_NOT_ACTIVE" };
  if (hasIncompleteResponses(questions, responses)) return { ok: false, code: "INCOMPLETE_ASSESSMENT" };
  return { ok: true };
}

export type DiagnosisDimension = {
  id: string;
  name: string;
  flow: ProfilingFlow;
  expected: number;
  actual: number;
  gap: number;
  status: DiagnosisStatus;
};

export function buildDiagnosis(questions: PilotQuestion[], dimensions: PilotDimension[], responses: Record<string, unknown>, tolerance = PROFILE_TOLERANCE) {
  const activeFlows = new Set(questions.map(question => question.flow));
  const scored = questions.map(question => ({ question, score: scoreResponse(responses[question.id]) })).filter((item): item is { question: PilotQuestion; score: number } => item.score !== null);
  const details: DiagnosisDimension[] = dimensions.filter(dimension => activeFlows.has(dimension.flow)).map(dimension => {
    const matches = scored.filter(item => item.question.dimensionId === dimension.id);
    const totalWeight = matches.reduce((sum, item) => sum + item.question.weight, 0);
    const actual = totalWeight ? Number((matches.reduce((sum, item) => sum + item.score * item.question.weight, 0) / totalWeight).toFixed(2)) : 0;
    const gap = Number(Math.max(0, dimension.expected - actual).toFixed(2));
    return { id: dimension.id, name: dimension.name, flow: dimension.flow, expected: dimension.expected, actual, gap, status: classifyProfileLevel(actual, dimension.expected, tolerance) };
  });
  return {
    tolerance,
    dimensions: details,
    flows: (["values", "competencies"] as ProfilingFlow[]).filter(flow => activeFlows.has(flow)).map(flow => ({
      flow,
      dimensions: details.filter(item => item.flow === flow),
    })),
  };
}
