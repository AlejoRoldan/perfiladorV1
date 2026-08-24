export type ProfilingFlow = "values" | "competencies";
export type ProfilingType = "por_pedido" | "obligatorio" | "matriz_capacidades" | "eval_tecnica" | "engineering_self_assessment" | "engineering_manager_review" | "engineering_calibration";
export type SessionExtension = "rapid" | "standard" | "deep";
export type SessionState = "draft" | "generating" | "in_review" | "generation_degraded" | "generation_failed" | "approved" | "active" | "closed";
export type GenerationStatus = "pending" | "running" | "completed" | "degraded" | "failed";
export type QuestionnaireOrigin = "ai" | "template" | "manual";
export type QuestionType = "scale" | "multiple_choice" | "true_false" | "complete" | "practical_scenario" | "short_answer";
export type DiagnosisStatus = "critical_gap" | "acceptable" | "outstanding";

export type PilotDimension = {
  id: string;
  name: string;
  flow: ProfilingFlow;
  expected: number;
  weight: number;
  source: "manual" | "weel_export" | "seed_itti" | "itti_engineering_matrix";
};

export type PilotQuestion = {
  id: string;
  flow: ProfilingFlow;
  dimensionId: string;
  type: QuestionType;
  prompt: string;
  required: boolean;
  weight: number;
  rubric?: string;
  options?: string[];
};

export type PilotSession = {
  id: string;
  name: string;
  profilingType: ProfilingType;
  extension: SessionExtension;
  activeFlows: ProfilingFlow[];
  participants: number;
  state: SessionState;
  generationStatus: GenerationStatus;
  origin: QuestionnaireOrigin;
  attempt: number;
  message: string;
  questions: PilotQuestion[];
};

export type AuditRecord = {
  id: string;
  action: string;
  detail: string;
  timestamp: string;
};

export const sessionTypeLabels: Record<ProfilingType, string> = {
  por_pedido: "Por pedido",
  obligatorio: "Obligatorio",
  matriz_capacidades: "Matriz de capacidades",
  eval_tecnica: "Evaluación técnica",
  engineering_self_assessment: "Autoevaluación Engineering · matriz Itti",
  engineering_manager_review: "Evaluación de manager Engineering · matriz Itti",
  engineering_calibration: "Calibración Engineering · matriz Itti",
};

export const extensionDefinitions: Record<SessionExtension, { label: string; duration: string; questions: string }> = {
  rapid: { label: "Rápida", duration: "~5 min", questions: "4–6 preguntas" },
  standard: { label: "Estándar", duration: "~10 min", questions: "8–12 preguntas" },
  deep: { label: "Profunda", duration: "~20 min", questions: "15–20 preguntas" },
};

export const questionTypeLabels: Record<QuestionType, string> = {
  scale: "Escala 1–4",
  multiple_choice: "Opción múltiple",
  true_false: "Verdadero / Falso",
  complete: "Completar",
  practical_scenario: "Escenario práctico",
  short_answer: "Respuesta breve",
};

export const initialDimensions: PilotDimension[] = [
  { id: "v-customer", name: "Orientación a las personas", flow: "values", expected: 3, weight: 1, source: "weel_export" },
  { id: "v-integrity", name: "Integridad y confianza", flow: "values", expected: 4, weight: 1.2, source: "weel_export" },
  { id: "v-collaboration", name: "Colaboración consciente", flow: "values", expected: 3, weight: 1, source: "weel_export" },
  { id: "c-strategy", name: "Pensamiento estratégico", flow: "competencies", expected: 3, weight: 1.3, source: "seed_itti" },
  { id: "c-communication", name: "Comunicación", flow: "competencies", expected: 3, weight: 1.1, source: "seed_itti" },
  { id: "c-delivery", name: "Orientación a resultados", flow: "competencies", expected: 3, weight: 1.2, source: "seed_itti" },
  { id: "c-data", name: "Análisis de datos", flow: "competencies", expected: 3, weight: 1, source: "seed_itti" },
];

export const generatedQuestions: PilotQuestion[] = [
  { id: "q-v-1", flow: "values", dimensionId: "v-integrity", type: "scale", prompt: "En decisiones complejas, explico con claridad los criterios y los impactos para las personas involucradas.", required: true, weight: 1.2 },
  { id: "q-v-2", flow: "values", dimensionId: "v-collaboration", type: "practical_scenario", prompt: "Describe cómo actuarías si un acuerdo de equipo cambia a último momento y existen intereses contrapuestos.", required: true, weight: 1.4, rubric: "Explica contexto, escucha a las partes, transparenta el cambio y propone un acuerdo verificable." },
  { id: "q-c-1", flow: "competencies", dimensionId: "c-strategy", type: "short_answer", prompt: "¿Qué señal usarías para priorizar una iniciativa de producto con información incompleta?", required: true, weight: 1.3 },
  { id: "q-c-2", flow: "competencies", dimensionId: "c-communication", type: "multiple_choice", prompt: "Selecciona la práctica que mejor sostiene una comunicación clara en un equipo multidisciplinario.", required: true, weight: 1.1, options: ["Documentar acuerdos y próximos pasos", "Esperar a tener toda la información", "Comunicar solo al finalizar", "Delegar toda comunicación"] },
  { id: "q-v-3", flow: "values", dimensionId: "v-customer", type: "short_answer", prompt: "¿Cómo incorporarías la voz de una persona usuaria antes de cerrar una decisión de producto?", required: true, weight: 1 },
  { id: "q-c-3", flow: "competencies", dimensionId: "c-delivery", type: "scale", prompt: "Convierto prioridades ambiguas en compromisos verificables y comunico sus riesgos a tiempo.", required: true, weight: 1.2 },
  { id: "q-v-4", flow: "values", dimensionId: "v-integrity", type: "true_false", prompt: "Cuando una decisión cambia, explico el motivo y el impacto a las personas afectadas.", required: true, weight: 1 },
  { id: "q-c-4", flow: "competencies", dimensionId: "c-data", type: "practical_scenario", prompt: "Un indicador de adopción cae dos semanas. Describe tu primer análisis antes de proponer una solución.", required: true, weight: 1.1, rubric: "Distingue señal de ruido, formula una hipótesis, contrasta fuentes y explicita el siguiente experimento." },
  { id: "q-v-5", flow: "values", dimensionId: "v-collaboration", type: "multiple_choice", prompt: "Selecciona la práctica que más fortalece una colaboración responsable.", required: true, weight: 1, options: ["Acordar criterios, responsables y seguimiento", "Resolver en privado sin registrar", "Evitar los desacuerdos", "Esperar instrucciones externas"] },
  { id: "q-c-5", flow: "competencies", dimensionId: "c-strategy", type: "complete", prompt: "Completá la frase: una decisión estratégica de producto prioriza ___, evidencia de ___ y una hipótesis de ___.", required: true, weight: 1.2 },
  { id: "q-v-6", flow: "values", dimensionId: "v-customer", type: "scale", prompt: "Considero los efectos de mis decisiones en colegas, clientes y aliados antes de ejecutar.", required: true, weight: 1 },
  { id: "q-c-6", flow: "competencies", dimensionId: "c-communication", type: "short_answer", prompt: "¿Cómo explicarías una decisión técnica compleja a una audiencia no técnica?", required: true, weight: 1.1 },
  { id: "q-v-7", flow: "values", dimensionId: "v-integrity", type: "practical_scenario", prompt: "Detectás una inconsistencia en una métrica ya presentada. ¿Qué hacés?", required: true, weight: 1.2, rubric: "Reconoce el error, informa a las partes, corrige la evidencia y previene su repetición." },
  { id: "q-c-7", flow: "competencies", dimensionId: "c-delivery", type: "multiple_choice", prompt: "¿Cuál es el primer paso al aparecer una dependencia que amenaza una entrega?", required: true, weight: 1.1, options: ["Visibilizar impacto y acordar alternativa", "Ocultarla hasta tener solución", "Duplicar el alcance", "Cancelar el objetivo"] },
  { id: "q-c-8", flow: "competencies", dimensionId: "c-data", type: "scale", prompt: "Uso métricas y evidencia cualitativa para ajustar decisiones de producto.", required: true, weight: 1 },
  { id: "q-v-8", flow: "values", dimensionId: "v-collaboration", type: "short_answer", prompt: "Describe cómo pedís y ofrecés feedback útil en un momento de tensión.", required: true, weight: 1 },
];

export function questionsForExtension(extension: SessionExtension, activeFlows: ProfilingFlow[]) {
  const targetByExtension: Record<SessionExtension, number> = { rapid: 5, standard: 10, deep: 15 };
  return generatedQuestions.filter(question => activeFlows.includes(question.flow)).slice(0, targetByExtension[extension]);
}
