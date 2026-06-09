// Tipos compartidos del frontend — espejo de los contratos del backend

export interface Pregunta {
  id: string;
  texto: string;
  competenciaId: string;
}

export interface Respuesta {
  preguntaId: string;
  valor: number;
}

export interface ScorePorCompetencia {
  competenciaId: string;
  score: number;
}

export interface NecesidadDetectada {
  competenciaId: string;
  scoreActual: number;
  scoreEsperado: number;
  brecha: number;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
}

export interface ScoreCompetenciaEvent {
  execution_id: string;
  user_id: string;
  role_id: string;
  scores_por_competencia: ScorePorCompetencia[];
  matrix_version: string;
  rule_version: string;
  timestamp: string;
}

export interface NecesidadDetectadaEvent {
  execution_id: string;
  user_id: string;
  necesidades: NecesidadDetectada[];
  timestamp: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type AppStep = 'welcome' | 'questionnaire' | 'results' | 'chat';
