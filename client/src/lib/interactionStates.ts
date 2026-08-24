export type DirectoryState = "ready" | "empty";

export function getDirectoryState(query: string, resultCount: number): DirectoryState {
  return query.trim().length > 0 && resultCount === 0 ? "empty" : "ready";
}

export type DraftValidation = { valid: true } | { valid: false; message: string };

export function validateAssessmentDraft(questionCount: number, competencyCount: number): DraftValidation {
  if (competencyCount < 1) return { valid: false, message: "Selecciona al menos una competencia antes de guardar." };
  if (questionCount < 2) return { valid: false, message: "Incluye al menos dos preguntas para publicar una versión." };
  return { valid: true };
}
