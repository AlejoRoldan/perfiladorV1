import type {
  Respuesta,
  ScoreCompetenciaEvent,
  NecesidadDetectadaEvent,
  ChatMessage,
} from '../types';

const API_BASE = '/api';

/**
 * Capa de Servicios (API Layer)
 * Responsabilidad Única: Centraliza todas las llamadas HTTP al backend.
 * Si el backend cambia de URL o protocolo, solo se modifica aquí.
 */

export async function submitDiagnostico(payload: {
  userId: string;
  roleId: string;
  respuestas: Respuesta[];
}): Promise<{ scoreEvent: ScoreCompetenciaEvent; necesidadEvent: NecesidadDetectadaEvent | null }> {
  const res = await fetch(`${API_BASE}/diagnostico`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Error al enviar diagnóstico: ${res.statusText}`);
  return res.json();
}

export async function sendChatMessage(payload: {
  executionId: string;
  userId: string;
  roleId: string;
  necesidades: NecesidadDetectadaEvent['necesidades'];
  history: ChatMessage[];
  userMessage: string;
}): Promise<{ reply: string }> {
  const res = await fetch(`${API_BASE}/agent/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Error al contactar al agente: ${res.statusText}`);
  return res.json();
}
