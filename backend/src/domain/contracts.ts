/**
 * Contratos del Dominio
 * Define las interfaces de entrada y salida para el motor de scoring.
 * Aplicamos el principio de Segregación de Interfaces (ISP).
 */

// --- Entrada (Input) ---

export interface Respuesta {
  preguntaId: string;
  valor: number; // Ej: 1 al 5
}

export interface ScoringInputPayload {
  executionId: string;
  userId: string;
  roleId: string;
  respuestas: Respuesta[];
}

// --- Salida (Output / Evento) ---

export interface ScorePorCompetencia {
  competenciaId: string;
  score: number;
}

export interface ScoreCompetenciaEvent {
  execution_id: string;
  user_id: string;
  role_id: string;
  scores_por_competencia: ScorePorCompetencia[];
  matrix_version: string;
  rule_version: string;
  timestamp: string; // ISO 8601
}

// --- Reglas de Negocio (Domain Models) ---

export interface MapeoPreguntaCompetencia {
  preguntaId: string;
  competenciaId: string;
  peso: number; // Por defecto 1, permite ponderar preguntas en el futuro
}

export interface ScoringMatrix {
  version: string;
  mapeos: MapeoPreguntaCompetencia[];
}
