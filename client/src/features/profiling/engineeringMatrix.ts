import type { PilotDimension, PilotQuestion, ProfilingFlow, SessionExtension } from "./pilotDomain";

export type EngineeringProfileId = "engineer-jr" | "engineer-ssr" | "engineer-sr" | "technical-lead" | "engineering-manager";

type EngineeringCompetency = {
  id: string;
  name: string;
  description: string;
};

export type EngineeringProfile = {
  id: EngineeringProfileId;
  role: string;
  seniority: string;
  family: "Software Engineering" | "Technical Leadership" | "People Leadership";
  expectedLevel: 1 | 2 | 3 | 4;
  anchors: Record<string, string>;
};

export const engineeringCompetencies: EngineeringCompetency[] = [
  {
    id: "eng-foundations",
    name: "Fundamentos técnicos y operativos",
    description: "Calidad, testing, observabilidad, SLAs, resiliencia, arquitectura y sostenibilidad técnica.",
  },
  {
    id: "eng-domain",
    name: "Dominio y visión",
    description: "Comprensión de negocio, producto, clientes, estrategia y decisiones técnicas con impacto.",
  },
  {
    id: "eng-ownership",
    name: "Ownership y mentoring",
    description: "Responsabilidad por entregables, resolución de problemas, dependencias, mejora continua y desarrollo de pares.",
  },
  {
    id: "eng-communication",
    name: "Comunicación y liderazgo",
    description: "Comunicación clara, colaboración, priorización, feedback, coordinación y gestión de stakeholders.",
  },
];

export const engineeringProfiles: EngineeringProfile[] = [
  {
    id: "engineer-jr",
    role: "Software Engineer",
    seniority: "Jr Engineer",
    family: "Software Engineering",
    expectedLevel: 1,
    anchors: {
      "eng-foundations": "Aprende estándares de código, repositorios, testing y monitoreo; identifica problemas simples con apoyo.",
      "eng-domain": "Desarrolla conocimiento del dominio y entiende cómo su trabajo impacta en la experiencia de cliente.",
      "eng-ownership": "Entrega subtareas bien definidas, pide ayuda cuando corresponde y valida que su trabajo funcione antes de cerrarlo.",
      "eng-communication": "Comunica avances y bloqueos al equipo, participa activamente y recibe feedback para aprender.",
    },
  },
  {
    id: "engineer-ssr",
    role: "Software Engineer",
    seniority: "Ssr Engineer",
    family: "Software Engineering",
    expectedLevel: 2,
    anchors: {
      "eng-foundations": "Aplica resiliencia y patrones de diseño, propone métricas, usa observabilidad y participa en pruebas de carga y estrés.",
      "eng-domain": "Obtiene contexto para trabajar con autonomía parcial, comprende integraciones y propone mejoras ligadas a métricas de negocio.",
      "eng-ownership": "Asume tareas complejas, las documenta y prueba; ayuda a pares con dudas técnicas y valida soluciones con referentes.",
      "eng-communication": "Estima trabajo, anticipa bloqueos y traduce requerimientos de negocio en tareas técnicas claras.",
    },
  },
  {
    id: "engineer-sr",
    role: "Software Engineer",
    seniority: "Sr Engineer",
    family: "Software Engineering",
    expectedLevel: 3,
    anchors: {
      "eng-foundations": "Prioriza consistencia, disponibilidad y performance; promueve post-mortems, calidad, HA/DR y estándares técnicos.",
      "eng-domain": "Comprende el dominio de forma autónoma y propone soluciones que mejoran la experiencia, el producto y las métricas del negocio.",
      "eng-ownership": "Coordina dependencias, lidera mejoras de código legacy y acompaña técnicamente a personas de menor seniority.",
      "eng-communication": "Da feedback, capacita técnicamente, prioriza y delega; contribuye a la estrategia técnica del equipo.",
    },
  },
  {
    id: "technical-lead",
    role: "Technical Lead",
    seniority: "Technical Lead",
    family: "Technical Leadership",
    expectedLevel: 4,
    anchors: {
      "eng-foundations": "Establece estándares de RFC, APIs, testing, SLAs, métricas, post-mortems, resiliencia y arquitectura escalable para su squad.",
      "eng-domain": "Balancea producto y técnica, entiende el ecosistema y propone soluciones que optimizan procesos, calidad y experiencia.",
      "eng-ownership": "Distribuye responsabilidad técnica, evita convertirse en cuello de botella y traduce problemas complejos para otros stakeholders.",
      "eng-communication": "Es referente y mentor técnico; construye consenso, media entre producto y tecnología e impulsa una cultura sólida de aprendizaje.",
    },
  },
  {
    id: "engineering-manager",
    role: "Engineering Manager",
    seniority: "Engineering Manager",
    family: "People Leadership",
    expectedLevel: 4,
    anchors: {
      "eng-foundations": "Gestiona incidentes y SLAs, simplifica decisiones con trade-offs claros y sostiene una arquitectura iterable y escalable.",
      "eng-domain": "Conecta la estrategia de su equipo, tribu y organización; prioriza dependencias, sostenibilidad y necesidades de producto.",
      "eng-ownership": "Asume decisiones del squad, define objetivos alineados a OKRs y promueve revisiones de desempeño y planes de desarrollo.",
      "eng-communication": "Desbloquea al equipo, gestiona stakeholders y roadmap, alinea expectativas de tiempo y calidad e identifica riesgos organizacionales.",
    },
  },
];

export const engineeringEvaluationTypes = [
  { id: "engineering_self_assessment", label: "Autoevaluación Engineering", owner: "Colaborador", purpose: "Reflexión guiada frente a las anclas de su rol y nivel." },
  { id: "engineering_manager_review", label: "Evaluación de manager Engineering", owner: "Manager", purpose: "Contraste de evidencia, resultados y comportamientos observables." },
  { id: "engineering_calibration", label: "Calibración Engineering", owner: "People & Culture + liderazgo", purpose: "Conversación de consistencia; no produce una decisión automática." },
] as const;

const valueDimensions: PilotDimension[] = [
  { id: "v-customer", name: "Orientación a las personas", flow: "values", expected: 3, weight: 1, source: "weel_export" },
  { id: "v-integrity", name: "Integridad y confianza", flow: "values", expected: 4, weight: 1.2, source: "weel_export" },
  { id: "v-collaboration", name: "Colaboración consciente", flow: "values", expected: 3, weight: 1, source: "weel_export" },
];

export function getEngineeringProfile(id: EngineeringProfileId) {
  return engineeringProfiles.find(profile => profile.id === id) ?? engineeringProfiles[1];
}

export function dimensionsForEngineeringProfile(id: EngineeringProfileId): PilotDimension[] {
  const profile = getEngineeringProfile(id);
  return [
    ...valueDimensions.map(dimension => ({ ...dimension })),
    ...engineeringCompetencies.map(competency => ({
      id: competency.id,
      name: competency.name,
      flow: "competencies" as const,
      expected: profile.expectedLevel,
      weight: 1,
      source: "itti_engineering_matrix" as const,
    })),
  ];
}

const valueQuestions: PilotQuestion[] = [
  { id: "q-v-integrity", flow: "values", dimensionId: "v-integrity", type: "practical_scenario", prompt: "Detectás una inconsistencia en una métrica o decisión ya comunicada. ¿Cómo actuás?", required: true, weight: 1.2, rubric: "Reconoce el riesgo, informa con transparencia, corrige la evidencia y propone una medida preventiva." },
  { id: "q-v-collaboration", flow: "values", dimensionId: "v-collaboration", type: "short_answer", prompt: "Describe cómo pedís y ofrecés feedback útil cuando existe tensión o desacuerdo técnico.", required: true, weight: 1 },
  { id: "q-v-people", flow: "values", dimensionId: "v-customer", type: "scale", prompt: "Considero los efectos de mis decisiones en colegas, clientes y aliados antes de ejecutar.", required: true, weight: 1 },
];

const engineeringQuestions: PilotQuestion[] = [
  { id: "q-eng-foundations", flow: "competencies", dimensionId: "eng-foundations", type: "scale", prompt: "En los servicios bajo mi responsabilidad uso testing, observabilidad y métricas para sostener calidad, estabilidad y desempeño.", required: true, weight: 1.2 },
  { id: "q-eng-incident", flow: "competencies", dimensionId: "eng-foundations", type: "practical_scenario", prompt: "Un servicio crítico muestra errores crecientes y puede incumplir un SLA. Describe tu primer abordaje.", required: true, weight: 1.3, rubric: "Explicita observabilidad, priorización, comunicación, mitigación, seguimiento y aprendizaje posterior." },
  { id: "q-eng-domain", flow: "competencies", dimensionId: "eng-domain", type: "short_answer", prompt: "Antes de implementar una funcionalidad, ¿cómo conectás la decisión técnica con una necesidad de producto y una señal de negocio?", required: true, weight: 1.1 },
  { id: "q-eng-domain-option", flow: "competencies", dimensionId: "eng-domain", type: "multiple_choice", prompt: "¿Qué práctica ayuda mejor a balancear una entrega con la sostenibilidad técnica?", required: true, weight: 1.1, options: ["Explicitar trade-offs, impacto y alternativa", "Aceptar el alcance sin analizar riesgos", "Posponer toda conversación técnica", "Elegir solo por la herramienta de moda"] },
  { id: "q-eng-ownership", flow: "competencies", dimensionId: "eng-ownership", type: "practical_scenario", prompt: "Una dependencia externa amenaza una entrega. Explica cómo asumís ownership sin ocultar el riesgo ni bloquear al equipo.", required: true, weight: 1.2, rubric: "Identifica dependencia e impacto, propone alternativas, coordina responsables, comunica estado y deja aprendizaje reutilizable." },
  { id: "q-eng-mentoring", flow: "competencies", dimensionId: "eng-ownership", type: "short_answer", prompt: "¿Cómo acompañás a una persona del equipo para que tome una decisión técnica con mayor autonomía?", required: true, weight: 1 },
  { id: "q-eng-communication", flow: "competencies", dimensionId: "eng-communication", type: "multiple_choice", prompt: "Ante un bloqueo con impacto en roadmap, ¿cuál es la comunicación más responsable?", required: true, weight: 1.1, options: ["Visibilizar impacto, opciones y siguiente punto de decisión", "Esperar hasta tener una solución perfecta", "Comunicar solo a una persona técnica", "Cerrar la tarea sin registrar el bloqueo"] },
  { id: "q-eng-leadership", flow: "competencies", dimensionId: "eng-communication", type: "scale", prompt: "Promuevo conversaciones claras, feedback accionable y acuerdos de prioridad con equipos y stakeholders.", required: true, weight: 1 },
];

export function questionsForEngineeringProfile(id: EngineeringProfileId, extension: SessionExtension, activeFlows: ProfilingFlow[]) {
  const profile = getEngineeringProfile(id);
  const targetByExtension: Record<SessionExtension, number> = { rapid: 5, standard: 10, deep: 15 };
  const profilePrompt = `Perfil de referencia: ${profile.role} · ${profile.seniority}.`;
  return [...valueQuestions, ...engineeringQuestions]
    .filter(question => activeFlows.includes(question.flow))
    .slice(0, targetByExtension[extension])
    .map(question => question.id === "q-eng-domain" ? { ...question, prompt: `${question.prompt} ${profilePrompt}` } : { ...question });
}
