import type { PilotDimension, PilotSession } from "./pilotDomain";

export const ASSESSMENT_PROGRESS_VERSION = 1;
const STORAGE_PREFIX = "itti-talent-compass:pilot-f1:assessment-progress";

export type AssessmentProgressSnapshot = {
  version: typeof ASSESSMENT_PROGRESS_VERSION;
  sessionId: string;
  participantId: string;
  session: PilotSession;
  dimensions: PilotDimension[];
  responses: Record<string, unknown>;
  savedAt: string;
};

export type AssessmentProgressStore = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function assessmentProgressKey(sessionId: string, participantId: string) {
  return `${STORAGE_PREFIX}:v${ASSESSMENT_PROGRESS_VERSION}:${sessionId}:${participantId}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isProgressSnapshot(value: unknown, sessionId: string, participantId: string): value is AssessmentProgressSnapshot {
  if (!isRecord(value)) return false;
  return value.version === ASSESSMENT_PROGRESS_VERSION
    && value.sessionId === sessionId
    && value.participantId === participantId
    && isRecord(value.session)
    && value.session.id === sessionId
    && Array.isArray(value.dimensions)
    && isRecord(value.responses)
    && typeof value.savedAt === "string";
}

export function getBrowserLocalStorage(): AssessmentProgressStore | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadAssessmentProgress(store: AssessmentProgressStore | null, sessionId: string, participantId: string): AssessmentProgressSnapshot | null {
  if (!store) return null;
  const key = assessmentProgressKey(sessionId, participantId);
  try {
    const raw = store.getItem(key);
    if (!raw) return null;
    const snapshot: unknown = JSON.parse(raw);
    if (isProgressSnapshot(snapshot, sessionId, participantId)) return snapshot;
    store.removeItem(key);
    return null;
  } catch {
    try {
      store.removeItem(key);
    } catch {
      // Si el navegador bloquea el almacenamiento, la demo continúa sin persistencia local.
    }
    return null;
  }
}

export function persistAssessmentProgress(
  store: AssessmentProgressStore | null,
  progress: Omit<AssessmentProgressSnapshot, "version" | "savedAt">,
): AssessmentProgressSnapshot | null {
  if (!store) return null;
  const snapshot: AssessmentProgressSnapshot = {
    ...progress,
    version: ASSESSMENT_PROGRESS_VERSION,
    dimensions: [...progress.dimensions],
    responses: { ...progress.responses },
    savedAt: new Date().toISOString(),
  };
  try {
    store.setItem(assessmentProgressKey(snapshot.sessionId, snapshot.participantId), JSON.stringify(snapshot));
    return snapshot;
  } catch {
    return null;
  }
}

export function clearAssessmentProgress(store: AssessmentProgressStore | null, sessionId: string, participantId: string) {
  if (!store) return false;
  try {
    store.removeItem(assessmentProgressKey(sessionId, participantId));
    return true;
  } catch {
    return false;
  }
}
