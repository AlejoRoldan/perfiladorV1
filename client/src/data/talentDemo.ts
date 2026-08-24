export type Competency = { id: string; name: string; domain: string; expected: number };

export type Employee = {
  id: string;
  name: string;
  initials: string;
  company: string;
  area: string;
  team: string;
  role: string;
  tenure: string;
  location: string;
  seniority: string;
  performance: number;
  potential: number;
  readiness: string;
  status: "Al día" | "En evaluación" | "Requiere revisión";
  lastEvaluation: string;
  skills: Record<string, number>;
  interests: string[];
  evidence: number;
};

export type AssessmentTemplate = {
  id: string;
  name: string;
  audience: string;
  status: "Publicada" | "Borrador" | "Archivada";
  due: string;
  assigned: number;
  completion: number;
  competencies: string[];
  questions: string[];
};

export type Opportunity = {
  id: string;
  title: string;
  company: string;
  area: string;
  deadline: string;
  status: "Abierta" | "Por validar";
  requiredSkills: Record<string, number>;
  desiredSkills: Record<string, number>;
};

export const companies = ["Vázquez Tecnología", "Vázquez Servicios", "Vázquez Logística"];
export const areas = ["Producto", "Tecnología", "Operaciones", "Comercial", "Experiencia", "Finanzas", "Personas", "Riesgo"];
export const teams = ["Plataformas", "Innovación", "Soporte", "Datos", "Canales", "Procesos", "Ventas B2B", "Personas", "Calidad", "Infraestructura", "Nexo", "Digital", "Control", "Learning", "Ecosistema"];
export const roles = ["Analista de datos", "Product Owner", "Líder de operaciones", "Especialista de personas", "Ingeniero de software", "Technical Lead", "Engineering Manager", "Diseñador de servicio", "Gestor comercial", "Analista de riesgo", "Coordinador de soporte", "Scrum Master", "Arquitecto de soluciones", "HRBP", "Especialista de aprendizaje", "Analista financiero", "Consultor de procesos", "Líder de experiencia", "DevOps", "Auditor interno", "Growth manager", "Coordinador de calidad"];
export const engineeringSeniorityLevels = ["Jr Engineer", "Ssr Engineer", "Sr Engineer", "Technical Lead", "Engineering Manager"];

export const competencies: Competency[] = [
  { id: "eng-foundations", name: "Fundamentos técnicos y operativos", domain: "Engineering · Matriz Itti", expected: 2 },
  { id: "eng-domain", name: "Dominio y visión", domain: "Engineering · Matriz Itti", expected: 2 },
  { id: "eng-ownership", name: "Ownership y mentoring", domain: "Engineering · Matriz Itti", expected: 2 },
  { id: "eng-communication", name: "Comunicación y liderazgo", domain: "Engineering · Matriz Itti", expected: 2 },
  { id: "strategic", name: "Pensamiento estratégico", domain: "Visión", expected: 4 },
  { id: "communication", name: "Comunicación", domain: "Relación", expected: 3 },
  { id: "leadership", name: "Liderazgo", domain: "Relación", expected: 4 },
  { id: "data", name: "Análisis de datos", domain: "Técnico", expected: 3 },
  { id: "delivery", name: "Orientación a resultados", domain: "Ejecución", expected: 4 },
  { id: "learning", name: "Aprendizaje ágil", domain: "Crecimiento", expected: 3 },
  { id: "collaboration", name: "Colaboración", domain: "Relación", expected: 3 },
  { id: "adaptability", name: "Adaptabilidad", domain: "Crecimiento", expected: 3 },
  { id: "customer", name: "Orientación al cliente", domain: "Visión", expected: 3 },
  { id: "innovation", name: "Innovación", domain: "Visión", expected: 3 },
  { id: "planning", name: "Planificación", domain: "Ejecución", expected: 3 },
  { id: "influence", name: "Influencia", domain: "Relación", expected: 3 },
  { id: "quality", name: "Calidad", domain: "Ejecución", expected: 3 },
  { id: "ownership", name: "Autonomía", domain: "Ejecución", expected: 3 },
  { id: "problem", name: "Resolución de problemas", domain: "Técnico", expected: 3 },
  { id: "systems", name: "Pensamiento sistémico", domain: "Técnico", expected: 3 },
  { id: "negotiation", name: "Negociación", domain: "Relación", expected: 3 },
  { id: "change", name: "Gestión del cambio", domain: "Crecimiento", expected: 3 },
  { id: "coaching", name: "Coaching", domain: "Relación", expected: 3 },
  { id: "security", name: "Cultura de seguridad", domain: "Técnico", expected: 3 },
  { id: "financial", name: "Visión financiera", domain: "Visión", expected: 3 },
  { id: "digital", name: "Fluidez digital", domain: "Técnico", expected: 3 },
  { id: "service", name: "Diseño de servicios", domain: "Visión", expected: 3 },
  { id: "execution", name: "Disciplina operativa", domain: "Ejecución", expected: 3 },
  { id: "wellbeing", name: "Autogestión", domain: "Crecimiento", expected: 3 },
];

const coreSkills = ["Pensamiento estratégico", "Comunicación", "Liderazgo", "Análisis de datos", "Orientación a resultados", "Aprendizaje ágil", "Colaboración", "Adaptabilidad"];

function skillSet(values: number[]): Record<string, number> {
  return Object.fromEntries(coreSkills.map((skill, index) => [skill, values[index] ?? 3]));
}

const featuredEmployees: Employee[] = [
  { id: "c-001", name: "Amara Vale", initials: "AV", company: companies[0], area: "Producto", team: "Innovación", role: "Product Owner", tenure: "3 años 4 meses", location: "Asunción", seniority: "Semi senior", performance: 91, potential: 88, readiness: "Lista en 6–12 meses", status: "Al día", lastEvaluation: "12 ago 2026", skills: skillSet([4, 4, 3, 4, 5, 4, 5, 4]), interests: ["Liderazgo de producto", "Estrategia"], evidence: 8 },
  { id: "c-002", name: "Nilo Seraf", initials: "NS", company: companies[1], area: "Operaciones", team: "Procesos", role: "Líder de operaciones", tenure: "5 años 1 mes", location: "San Lorenzo", seniority: "Senior", performance: 86, potential: 90, readiness: "Lista en 12 meses", status: "Al día", lastEvaluation: "08 ago 2026", skills: skillSet([4, 3, 5, 3, 5, 4, 4, 4]), interests: ["Gerencia operativa", "Transformación"], evidence: 11 },
  { id: "c-003", name: "Lira Solen", initials: "LS", company: companies[0], area: "Tecnología", team: "Datos", role: "Analista de datos", tenure: "1 año 8 meses", location: "Asunción", seniority: "Junior", performance: 82, potential: 87, readiness: "En desarrollo", status: "En evaluación", lastEvaluation: "Pendiente", skills: skillSet([3, 4, 2, 5, 4, 5, 4, 4]), interests: ["Analítica de producto", "Data science"], evidence: 5 },
  { id: "c-004", name: "Teo Mair", initials: "TM", company: companies[2], area: "Comercial", team: "Ventas B2B", role: "Gestor comercial", tenure: "2 años 2 meses", location: "Luque", seniority: "Semi senior", performance: 79, potential: 76, readiness: "Preparación focalizada", status: "Requiere revisión", lastEvaluation: "05 ago 2026", skills: skillSet([3, 5, 3, 2, 4, 3, 4, 3]), interests: ["Relaciones estratégicas"], evidence: 4 },
  { id: "c-005", name: "Eira Nox", initials: "EN", company: companies[1], area: "Personas", team: "Learning", role: "Especialista de aprendizaje", tenure: "4 años 6 meses", location: "Asunción", seniority: "Senior", performance: 89, potential: 84, readiness: "Lista en 6–12 meses", status: "Al día", lastEvaluation: "01 ago 2026", skills: skillSet([4, 5, 4, 3, 4, 5, 5, 4]), interests: ["Desarrollo organizacional", "People analytics"], evidence: 9 },
  { id: "c-006", name: "Cael Doren", initials: "CD", company: companies[0], area: "Experiencia", team: "Canales", role: "Diseñador de servicio", tenure: "2 años 9 meses", location: "Asunción", seniority: "Semi senior", performance: 84, potential: 86, readiness: "Lista en 12 meses", status: "Al día", lastEvaluation: "29 jul 2026", skills: skillSet([4, 4, 3, 3, 4, 4, 5, 5]), interests: ["Experiencia de cliente", "Innovación"], evidence: 7 },
  { id: "c-007", name: "Vera Elian", initials: "VE", company: companies[2], area: "Finanzas", team: "Control", role: "Analista financiero", tenure: "3 años", location: "Fernando de la Mora", seniority: "Semi senior", performance: 77, potential: 72, readiness: "Preparación focalizada", status: "En evaluación", lastEvaluation: "Pendiente", skills: skillSet([3, 3, 2, 4, 4, 3, 3, 3]), interests: ["Planificación financiera"], evidence: 6 },
  { id: "c-008", name: "Ivo Rian", initials: "IR", company: companies[1], area: "Tecnología", team: "Plataformas", role: "Ingeniero de software", tenure: "5 años 8 meses", location: "Asunción", seniority: "Senior", performance: 93, potential: 81, readiness: "Lista en 12 meses", status: "Al día", lastEvaluation: "22 jul 2026", skills: skillSet([3, 3, 3, 5, 5, 4, 4, 3]), interests: ["Arquitectura", "Mentoría"], evidence: 12 },
];

const syntheticNames = ["Ari Lune", "Rena Cor", "Milo Venn", "Sia Nor", "Lio Adar", "Nara Voss", "Elo Mara", "Sol Rian", "Dani Korr", "Iria Venn", "Noa Ver", "Tilo Aster"];

export const demoEmployees: Employee[] = [
  ...featuredEmployees,
  ...Array.from({ length: 72 }, (_, index) => {
    const number = index + 9;
    const seed = index % 5;
    return {
      id: `c-${String(number).padStart(3, "0")}`,
      name: `${syntheticNames[index % syntheticNames.length]} ${String.fromCharCode(65 + (index % 20))}.`,
      initials: syntheticNames[index % syntheticNames.length].split(" ").map(item => item[0]).join(""),
      company: companies[index % companies.length],
      area: areas[index % areas.length],
      team: teams[index % teams.length],
      role: roles[index % roles.length],
      tenure: `${1 + (index % 7)} años ${index % 11} meses`,
      location: ["Asunción", "Luque", "San Lorenzo", "Fernando de la Mora"][index % 4],
      seniority: ["Junior", "Semi senior", "Senior"][index % 3],
      performance: 68 + ((index * 7) % 27),
      potential: 65 + ((index * 11) % 30),
      readiness: ["En desarrollo", "Lista en 12 meses", "Preparación focalizada"][index % 3],
      status: ["Al día", "En evaluación", "Al día", "Requiere revisión"][index % 4] as Employee["status"],
      lastEvaluation: seed === 1 ? "Pendiente" : `${10 + seed} jul 2026`,
      skills: skillSet(coreSkills.map((_, skillIndex) => 2 + ((index + skillIndex) % 4))),
      interests: ["Crecimiento interno", "Aprendizaje continuo"],
      evidence: 2 + (index % 9),
    };
  }),
];

export const assessmentTemplates: AssessmentTemplate[] = [
  { id: "a-001", name: "Desempeño y potencial 2026", audience: "Colaboradores administrativos", status: "Publicada", due: "30 ago 2026", assigned: 64, completion: 72, competencies: ["Orientación a resultados", "Comunicación", "Aprendizaje ágil"], questions: ["¿Cómo prioriza compromisos ante cambios?", "Describa una evidencia de aprendizaje aplicado.", "Valore la claridad de su comunicación."] },
  { id: "a-002", name: "Liderazgo de equipos", audience: "Líderes y referentes", status: "Publicada", due: "05 sep 2026", assigned: 28, completion: 43, competencies: ["Liderazgo", "Colaboración", "Pensamiento estratégico"], questions: ["¿Cómo habilita el desarrollo de su equipo?", "Valore su capacidad para orientar decisiones."] },
  { id: "a-003", name: "Perfil de habilidades digitales", audience: "Tecnología y datos", status: "Borrador", due: "Sin fecha", assigned: 0, completion: 0, competencies: ["Análisis de datos", "Adaptabilidad"], questions: ["Seleccione las herramientas que utiliza.", "Resuelva el caso de priorización."] },
  { id: "a-004", name: "Experiencia de cliente", audience: "Canales y comercial", status: "Publicada", due: "18 sep 2026", assigned: 42, completion: 36, competencies: ["Comunicación", "Colaboración"], questions: ["Describa una mejora para una experiencia compleja."] },
  { id: "a-005", name: "Preparación para movilidad", audience: "Talento identificado", status: "Archivada", due: "Cerrada", assigned: 18, completion: 100, competencies: ["Pensamiento estratégico", "Liderazgo"], questions: ["Indique su interés de carrera."] },
  { id: "a-006", name: "Autoevaluación Engineering · Matriz Itti", audience: "Software Engineering", status: "Borrador", due: "Sin fecha", assigned: 0, completion: 0, competencies: ["Fundamentos técnicos y operativos", "Dominio y visión", "Ownership y mentoring", "Comunicación y liderazgo"], questions: ["Reflexione sobre la calidad y operación de los servicios bajo su responsabilidad.", "Describa cómo conecta una decisión técnica con una necesidad de producto."] },
  { id: "a-007", name: "Evaluación de manager Engineering · Matriz Itti", audience: "Managers Engineering", status: "Borrador", due: "Sin fecha", assigned: 0, completion: 0, competencies: ["Fundamentos técnicos y operativos", "Dominio y visión", "Ownership y mentoring", "Comunicación y liderazgo"], questions: ["Describa evidencia observable de ownership y colaboración.", "Valore la autonomía frente a las anclas del rol."] },
  { id: "a-008", name: "Calibración Engineering · Matriz Itti", audience: "People & Culture y liderazgo", status: "Borrador", due: "Sin fecha", assigned: 0, completion: 0, competencies: ["Fundamentos técnicos y operativos", "Dominio y visión", "Ownership y mentoring", "Comunicación y liderazgo"], questions: ["Registre evidencia y acuerdos de calibración; no emita una decisión automática."] },
];

export const opportunities: Opportunity[] = [
  { id: "o-001", title: "Product Lead · Canales digitales", company: companies[0], area: "Producto", deadline: "26 ago 2026", status: "Abierta", requiredSkills: { "Pensamiento estratégico": 4, Comunicación: 4, "Orientación a resultados": 4 }, desiredSkills: { Liderazgo: 3, "Análisis de datos": 3 } },
  { id: "o-002", title: "Líder de excelencia operativa", company: companies[1], area: "Operaciones", deadline: "02 sep 2026", status: "Abierta", requiredSkills: { Liderazgo: 4, "Orientación a resultados": 4, Colaboración: 4 }, desiredSkills: { "Pensamiento estratégico": 4, Adaptabilidad: 3 } },
  { id: "o-003", title: "Especialista People Analytics", company: companies[1], area: "Personas", deadline: "09 sep 2026", status: "Por validar", requiredSkills: { "Análisis de datos": 4, Comunicación: 3, "Aprendizaje ágil": 4 }, desiredSkills: { "Pensamiento estratégico": 3, Colaboración: 4 } },
  { id: "o-004", title: "Service Design Lead", company: companies[0], area: "Experiencia", deadline: "12 sep 2026", status: "Abierta", requiredSkills: { Comunicación: 4, Colaboración: 4, Adaptabilidad: 4 }, desiredSkills: { "Pensamiento estratégico": 4, Liderazgo: 3 } },
  ...Array.from({ length: 6 }, (_, index) => ({ id: `o-${String(index + 5).padStart(3, "0")}`, title: ["Coordinación de soporte", "Consultoría de procesos", "Liderazgo comercial", "Analista de riesgo senior", "Arquitectura de soluciones", "Gestión de aprendizaje"][index], company: companies[index % 3], area: areas[index % areas.length], deadline: `${18 + index} sep 2026`, status: index % 2 ? "Por validar" : "Abierta" as Opportunity["status"], requiredSkills: { "Orientación a resultados": 3 + (index % 2), Comunicación: 3, Adaptabilidad: 3 }, desiredSkills: { Liderazgo: 3, "Análisis de datos": 3 } })),
];

export const auditEvents = [
  { action: "Evaluación asignada", detail: "Desempeño y potencial 2026 · 12 colaboradores", actor: "Maya R., People & Culture", date: "Hoy · 09:42", type: "Asignación" },
  { action: "Resultado recalculado", detail: "Amara Vale · Perfil 360°", actor: "Motor determinístico v1.0", date: "Hoy · 09:18", type: "Cálculo" },
  { action: "Oportunidad consultada", detail: "Product Lead · Canales digitales", actor: "Maya R., People & Culture", date: "Ayer · 16:05", type: "Consulta" },
  { action: "Exportación solicitada", detail: "Reporte de brechas por área", actor: "Maya R., People & Culture", date: "Ayer · 10:12", type: "Exportación" },
];

export const dashboardBars = [
  { area: "Producto", readiness: 78, gap: 24 },
  { area: "Tecnología", readiness: 71, gap: 18 },
  { area: "Operaciones", readiness: 69, gap: 31 },
  { area: "Personas", readiness: 82, gap: 16 },
  { area: "Comercial", readiness: 63, gap: 37 },
];
