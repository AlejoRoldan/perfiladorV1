import { AlertTriangle, ArrowRight, Check, ChevronDown, ClipboardCheck, Download, FileQuestion, Gauge, Info, ListChecks, Loader2, Plus, RefreshCw, Send, Settings2, ShieldCheck, Sparkles, UsersRound, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Radar, RadarChart, PolarAngleAxis, PolarGrid, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { demoEmployees } from "@/data/talentDemo";
import { approveReviewedSession, buildDiagnosis, createDegradedSession, createManualQuestionnaire, createReviewedQuestionnaire, distributeApprovedSession, lockAssessmentProgress, scoreResponse, validateAssessmentSubmission, validateSessionForApproval } from "./pilotEngine";
import { clearAssessmentProgress, getBrowserLocalStorage, loadAssessmentProgress, persistAssessmentProgress } from "./assessmentProgressStore";
import { dimensionsForEngineeringProfile, engineeringEvaluationTypes, engineeringProfiles, getEngineeringProfile, questionsForEngineeringProfile, type EngineeringProfileId } from "./engineeringMatrix";
import { extensionDefinitions, initialDimensions, questionTypeLabels, questionsForExtension, sessionTypeLabels, type AuditRecord, type PilotDimension, type PilotQuestion, type PilotSession, type ProfilingFlow, type ProfilingType, type QuestionType, type SessionExtension } from "./pilotDomain";
import { TalentStartPanel } from "./TalentStartPanel";
import { PilotSessionsPanel } from "./PilotSessionsPanel";
import { CollaboratorReportPanel } from "./CollaboratorReportPanel";
import "./pilotProfiler.css";
import "./pilotMockupShell.css";
import "./pilotMockupRefinements.css";
import type { AccessRole } from "@shared/accessControl";

type PilotTab = "overview" | "config" | "sessions" | "session" | "hitl" | "assessment" | "report" | "diagnosis" | "contract";

const tabs: Array<{ id: PilotTab; hu: string; label: string; icon: typeof Settings2 }> = [
  { id: "overview", hu: "Inicio", label: "Inicio", icon: Gauge },
  { id: "config", hu: "H2", label: "Configuración", icon: Settings2 },
  { id: "sessions", hu: "H3", label: "Sesiones", icon: Sparkles },
  { id: "session", hu: "H3–H4", label: "Crear sesión", icon: Sparkles },
  { id: "hitl", hu: "H5", label: "Revisión", icon: ListChecks },
  { id: "assessment", hu: "H6", label: "Autoevaluación", icon: ClipboardCheck },
  { id: "report", hu: "H6–H7", label: "Reporte propio", icon: Gauge },
  { id: "diagnosis", hu: "H7", label: "Diagnóstico", icon: Gauge },
  { id: "contract", hu: "H8", label: "OpenAPI", icon: FileQuestion },
];

const flowLabel: Record<ProfilingFlow, string> = { values: "Valores", competencies: "Competencias" };

function statusCopy(state: PilotSession["state"]) {
  return ({ draft: "Borrador", generating: "Generando", in_review: "En revisión", generation_degraded: "Generación degradada", generation_failed: "Generación fallida", approved: "Aprobada", active: "Distribuida", closed: "Vencida" })[state];
}

const defaultEngineeringProfileId: EngineeringProfileId = "engineer-ssr";

function createInitialPilotSession(profileId: EngineeringProfileId = defaultEngineeringProfileId): PilotSession {
  const profile = getEngineeringProfile(profileId);
  return { id: "session-f1-engineering-v1", name: `Perfilamiento Engineering · ${profile.seniority}`, profilingType: "engineering_self_assessment", extension: "standard", activeFlows: ["values", "competencies"], participants: 12, state: "draft", generationStatus: "pending", origin: "ai", attempt: 0, message: "La sesión está lista para generar un borrador revisable basado en la matriz de Engineering.", questions: [] };
}

function inputAnswer(question: PilotQuestion, value: unknown, setValue: (value: unknown) => void, locked = false) {
  if (question.type === "scale") return <div className="pilot-scale" aria-label={question.prompt}>{[1, 2, 3, 4].map(score => <label key={score}><input type="radio" name={question.id} checked={value === score} disabled={locked} onChange={() => setValue(score)} /><span><strong>{score}</strong><small>{["Inicio", "En desarrollo", "Consistente", "Dominio"][score - 1]}</small></span></label>)}</div>;
  if (question.type === "true_false") return <div className="pilot-binary"><button type="button" disabled={locked} aria-pressed={value === true} className={value === true ? "selected" : ""} onClick={() => setValue(true)}>Verdadero</button><button type="button" disabled={locked} aria-pressed={value === false} className={value === false ? "selected" : ""} onClick={() => setValue(false)}>Falso</button></div>;
  if (question.type === "multiple_choice") return <select disabled={locked} value={typeof value === "number" ? String(value) : ""} onChange={event => setValue(Number(event.target.value))}><option value="">Seleccioná una respuesta</option>{question.options?.map((option, index) => <option key={option} value={Math.min(4, index + 1)}>{option}</option>)}</select>;
  return <textarea disabled={locked} value={typeof value === "string" ? value : ""} onChange={event => setValue(event.target.value)} placeholder={question.type === "practical_scenario" ? "Describe contexto, decisión, evidencia y resultado esperado." : "Escribe tu respuesta breve."} />;
}

export default function PilotProfiler({ accessRole = "people_ops" }: { accessRole?: AccessRole }) {
  const demoEmployee = demoEmployees.find(employee => employee.role === "Ingeniero de software") ?? demoEmployees[0];
  const [restoredProgress] = useState(() => loadAssessmentProgress(getBrowserLocalStorage(), createInitialPilotSession().id, demoEmployee.id));
  const [engineeringProfileId, setEngineeringProfileId] = useState<EngineeringProfileId>(defaultEngineeringProfileId);
  const isTalentOperator = accessRole === "admin" || accessRole === "people_ops";
  const [tab, setTab] = useState<PilotTab>(() => isTalentOperator && !restoredProgress ? "overview" : "assessment");
  const [dimensions, setDimensions] = useState<PilotDimension[]>(() => restoredProgress?.dimensions ?? dimensionsForEngineeringProfile(defaultEngineeringProfileId));
  const [session, setSession] = useState<PilotSession>(() => restoredProgress?.session ?? createInitialPilotSession());
  const [audit, setAudit] = useState<AuditRecord[]>(() => [{ id: "a-1", action: "Contexto de demo cargado", detail: "Engineering · 12 colaboradores sintéticos · sin autenticación.", timestamp: "Ahora" }, ...(restoredProgress ? [{ id: "a-restored", action: "Progreso restaurado", detail: "Las respuestas parciales de H6 se recuperaron desde este navegador de demo.", timestamp: "Ahora" }] : [])]);
  const [responses, setResponses] = useState<Record<string, unknown>>(() => restoredProgress?.responses ?? {});
  const [submitted, setSubmitted] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<ProfilingFlow>("values");
  const [simulateDegraded, setSimulateDegraded] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(() => restoredProgress?.savedAt ?? null);

  const activeDimensions = dimensions.filter(dimension => session.activeFlows.includes(dimension.flow));
  const engineeringProfile = getEngineeringProfile(engineeringProfileId);
  const talentNavigation = tabs.filter(item => ["overview", "config", "sessions", "hitl", "diagnosis"].includes(item.id));
  const talentStepIndex = talentNavigation.findIndex(item => item.id === tab);
  const showCollaboratorExperience = tab === "assessment" || tab === "report";
  const answeredQuestions = Object.values(responses).filter(value => scoreResponse(value) !== null).length;
  const collaboratorProgress = session.questions.length === 0 ? 0 : Math.round((answeredQuestions / session.questions.length) * 100);
  const diagnosis = useMemo(() => buildDiagnosis(session.questions, activeDimensions, responses), [session.questions, activeDimensions, responses]);
  useEffect(() => {
    if (!isTalentOperator && !["assessment", "report"].includes(tab)) setTab("assessment");
  }, [isTalentOperator, tab]);
  const sessionErrors = validateSessionForApproval(session);
  const record = (action: string, detail: string) => setAudit(current => [{ id: `a-${Date.now()}`, action, detail, timestamp: "Ahora" }, ...current].slice(0, 8));
  const updateDimension = (id: string, patch: Partial<PilotDimension>) => setDimensions(current => current.map(dimension => {
    if (dimension.id !== id) return dimension;
    const changedOfficialField = dimension.source === "itti_engineering_matrix" && (patch.name !== undefined || patch.expected !== undefined || patch.weight !== undefined);
    return { ...dimension, ...patch, ...(changedOfficialField ? { source: "manual" as const } : {}) };
  }));

  const applyEngineeringProfile = (profileId: EngineeringProfileId) => {
    if (session.state !== "draft") return toast.error("SESSION_NOT_EDITABLE: seleccioná el perfil antes de generar o distribuir la sesión.");
    const profile = getEngineeringProfile(profileId);
    setEngineeringProfileId(profileId);
    setDimensions(dimensionsForEngineeringProfile(profileId));
    setSession(current => ({ ...current, name: `Perfilamiento Engineering · ${profile.seniority}`, profilingType: "engineering_self_assessment", questions: [], message: `Configuración cargada desde la matriz de Engineering para ${profile.role} · ${profile.seniority}.` }));
    setResponses({});
    clearAssessmentProgress(getBrowserLocalStorage(), session.id, demoEmployee.id);
    setLastSavedAt(null);
    record("Perfil Engineering aplicado", `${profile.role} · ${profile.seniority}; cuatro competencias oficiales y sus anclas conductuales cargadas.`);
    toast.success(`Matriz aplicada para ${profile.role} · ${profile.seniority}.`);
  };

  useEffect(() => {
    if (submitted || session.state !== "active" || Object.keys(responses).length === 0) return;
    const snapshot = persistAssessmentProgress(getBrowserLocalStorage(), { sessionId: session.id, participantId: demoEmployee.id, session, dimensions, responses });
    if (snapshot) setLastSavedAt(snapshot.savedAt);
  }, [demoEmployee.id, dimensions, responses, session, submitted]);

  const generate = (forceDegraded = false) => {
    if (session.state === "approved" || session.state === "active") return toast.error("SESSION_NOT_EDITABLE: una sesión aprobada o activa no se puede regenerar.");
    const nextAttempt = session.attempt + 1;
    setSession(current => ({ ...current, state: "generating", generationStatus: "running", attempt: nextAttempt, message: `Generando borrador, intento ${nextAttempt} de 2.` }));
    record("Generación iniciada", `Intento ${nextAttempt} con configuración ${sessionTypeLabels[session.profilingType]}.`);
    window.setTimeout(() => {
      if (forceDegraded || simulateDegraded) {
        setSession(current => createDegradedSession(current));
        record("Generación degradada", "El borrador no fue creado; se ofrecieron alternativas seguras.");
        return;
      }
      setSession(current => {
        const questions = current.profilingType.startsWith("engineering_")
          ? questionsForEngineeringProfile(engineeringProfileId, current.extension, current.activeFlows)
          : questionsForExtension(current.extension, current.activeFlows);
        return createReviewedQuestionnaire(current, "ai", questions);
      });
      record("Borrador generado", `Cuestionario AI enviado a revisión humana para ${engineeringProfile.role} · ${engineeringProfile.seniority}.`);
    }, 650);
  };

  const useTemplate = () => {
    setSession(current => {
      const questions = current.profilingType.startsWith("engineering_")
        ? questionsForEngineeringProfile(engineeringProfileId, current.extension, current.activeFlows)
        : questionsForExtension(current.extension, current.activeFlows);
      return createReviewedQuestionnaire(current, "template", questions);
    });
    record("Plantilla aplicada", `Origen template · matriz oficial de Engineering para ${engineeringProfile.seniority}.`);
  };

  const useManual = () => {
    setSession(current => createManualQuestionnaire(current));
    record("Cuestionario manual creado", "Origen manual · sin preguntas iniciales.");
  };

  const updateQuestion = (id: string, patch: Partial<PilotQuestion>) => {
    if (session.state === "approved" || session.state === "active") return toast.error("SESSION_NOT_EDITABLE: la sesión ya no admite cambios.");
    setSession(current => ({ ...current, questions: current.questions.map(question => question.id === id ? { ...question, ...patch } : question) }));
    record("Pregunta editada", `Se modificó una pregunta de la sesión ${session.id}.`);
  };

  const addQuestion = () => {
    if (session.state === "approved" || session.state === "active") return toast.error("SESSION_NOT_EDITABLE: la sesión ya no admite cambios.");
    const defaultDimension = activeDimensions.find(dimension => dimension.flow === "competencies") ?? activeDimensions[0];
    if (!defaultDimension) return toast.error("Definí al menos una dimensión antes de agregar preguntas.");
    setSession(current => ({ ...current, questions: [...current.questions, { id: `q-manual-${Date.now()}`, flow: defaultDimension.flow, dimensionId: defaultDimension.id, type: "scale", prompt: "Nueva pregunta de perfilamiento", required: true, weight: 1 }] }));
    record("Pregunta manual agregada", "Origen manual dentro de un cuestionario revisable.");
  };

  const approve = () => {
    const result = approveReviewedSession(session);
    if (!result.ok) return toast.error(result.code === "SESSION_NOT_IN_REVIEW" ? "SESSION_NOT_IN_REVIEW: la aprobación requiere una sesión en revisión." : result.errors.map(error => error.detail).join(" "));
    setSession(result.session);
    record("Cuestionario aprobado", `Origen ${session.origin}; invariantes de flujos y rúbricas validadas.`);
    toast.success("Cuestionario aprobado con trazabilidad HITL.");
  };

  const distribute = () => {
    const result = distributeApprovedSession(session);
    if (!result.ok) return toast.error("SESSION_NOT_APPROVED: la distribución solo está disponible desde approved.");
    setSession(result.session);
    record("Sesión distribuida", `${session.participants} evaluaciones asignadas en modo demo.`);
    toast.success(`${session.participants} evaluaciones demo creadas.`);
  };

  const submitAssessment = () => {
    const result = validateAssessmentSubmission(session, session.questions, responses);
    if (!result.ok) return toast.error(result.code === "SESSION_NOT_ACTIVE" ? "La autoevaluación estará disponible cuando la sesión esté activa." : "INCOMPLETE_ASSESSMENT: completá todas las preguntas obligatorias.");
    setSubmitted(true);
    setResponses(current => lockAssessmentProgress(current));
    clearAssessmentProgress(getBrowserLocalStorage(), session.id, demoEmployee.id);
    setLastSavedAt(null);
    record("Autoevaluación enviada", "AssessmentSubmitted · scoring determinístico pendiente completado en demo.");
    toast.success("Autoevaluación enviada. El diagnóstico ya puede consultarse.");
  };

  const createConfigDimension = (flow: ProfilingFlow) => {
    const label = flow === "values" ? "Nuevo valor demo" : "Nueva competencia demo";
    setDimensions(current => [...current, { id: `${flow}-${Date.now()}`, name: label, flow, expected: 3, weight: 1, source: "manual" }]);
    record("Dimensión agregada", `${label} en flujo ${flowLabel[flow]}.`);
  };

  const configValid = dimensions.filter(dimension => dimension.flow === "values").length > 0 && dimensions.filter(dimension => dimension.flow === "competencies").length > 0 && dimensions.every(dimension => dimension.expected >= 1 && dimension.expected <= 4);

  return <div className="pilot-shell pilot-standalone" aria-busy={session.state === "generating"}>
    <div className={`pilot-experience ${showCollaboratorExperience ? "pilot-experience-collaborator" : "pilot-experience-talent"}`}>
      {isTalentOperator && !showCollaboratorExperience && <aside className="pilot-flow-sidebar" aria-label="Flujo de trabajo de Talento">
        <div className="pilot-flow-brand"><span>ITTI</span><strong>Perfilador UCorp</strong><small>Piloto F1 · standalone</small></div>
        <div className="pilot-flow-summary"><span>Flujo de Talento</span><strong>{engineeringProfile.family}</strong><p>{engineeringProfile.role} · {engineeringProfile.seniority}</p></div>
        <nav className="pilot-flow-nav" aria-label="Pasos del Perfilador">{talentNavigation.map((item, index) => <button type="button" aria-current={tab === item.id ? "step" : undefined} key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}><span className="pilot-flow-number">{String(index + 1).padStart(2, "0")}</span><item.icon size={16} /><span>{item.label}<small>{item.id === "config" ? "Matriz y contexto" : item.id === "session" ? "Crear y distribuir" : item.id === "hitl" ? "Revisión humana" : "Brechas y desarrollo"}</small></span></button>)}</nav>
        <div className="pilot-flow-sidebar-footer"><button type="button" onClick={() => setTab("assessment")}><ClipboardCheck size={16} />Vista del colaborador</button><button type="button" onClick={() => setTab("contract")}><FileQuestion size={16} />Referencia técnica</button></div>
      </aside>}
      <main className="pilot-main-stage">
        {tab === "overview" && <TalentStartPanel session={session} onNavigate={setTab} />}
        {showCollaboratorExperience ? <header className="pilot-collaborator-header"><div><span>ITTI · Perfilador UCorp</span><strong>{tab === "report" ? "Mi reporte de desarrollo" : "Mi autoevaluación de desarrollo"}</strong><small>{demoEmployee.name} · {engineeringProfile.role} · {engineeringProfile.seniority}</small></div><div className="pilot-collaborator-progress"><span>{submitted ? "Evaluación enviada" : `${answeredQuestions}/${session.questions.length} respondidas`}</span><div role="progressbar" aria-label="Progreso de autoevaluación" aria-valuemin={0} aria-valuemax={100} aria-valuenow={submitted ? 100 : collaboratorProgress}><i style={{ width: `${submitted ? 100 : collaboratorProgress}%` }} /></div>{isTalentOperator && <button type="button" onClick={() => setTab("overview")}>Volver a Talento</button>}</div></header> : <section className="pilot-hero">
          <div><p className="eyebrow">Perfilador UCorp · Talento</p><h1>Diagnósticos de desarrollo con evidencia y revisión humana.</h1><p>Configurá el instrumento, reuní a los participantes y convertí resultados en conversaciones de crecimiento. La demo no automatiza decisiones de carrera.</p></div>
          <div className="pilot-hero-status"><ShieldCheck size={19} /><div><strong>Modo demo standalone</strong><span>Engineering · matriz oficial + valores demostrativos</span></div></div>
        </section>}
    {session.state === "generating" && <section className="pilot-loading-card" role="status" aria-live="polite"><Loader2 size={18} /><div><strong>Estamos preparando un borrador revisable</strong><p>{session.message} Podés mantener esta vista abierta: el equipo podrá editar cada pregunta antes de aprobar.</p></div><div className="pilot-skeleton-lines" aria-hidden="true"><span /><span /><span /></div></section>}
    <details className="pilot-disclosure"><summary><span>Ver trazabilidad de la sesión</span><ChevronDown size={16} /></summary><div className="pilot-disclosure-body">{audit.map(entry => <div key={`disclosure-${entry.id}`}><span>{entry.timestamp}</span><strong>{entry.action}</strong><p>{entry.detail}</p></div>)}</div></details>

    {tab === "config" && <section className="pilot-stack">
      <div className="pilot-heading"><div><p className="eyebrow">H2 · Configuración dual</p><h2>Valores y competencias para Engineering</h2><p>La matriz de People & Culture define las expectativas por rol y seniority. La escala 1–4 normaliza la progresión sin automatizar una decisión de carrera.</p></div><span className={`pilot-validation ${configValid ? "valid" : "invalid"}`}>{configValid ? <Check size={15} /> : <AlertTriangle size={15} />}{configValid ? "Configuración válida" : "Configuración incompleta"}</span></div>
      <div className="pilot-context"><label>Área<select value="Engineering" disabled><option>Engineering</option></select></label><label>Rol<select value={engineeringProfileId} onChange={event => applyEngineeringProfile(event.target.value as EngineeringProfileId)}>{engineeringProfiles.map(profile => <option key={profile.id} value={profile.id}>{profile.role}</option>)}</select></label><label>Seniority<input value={engineeringProfile.seniority} readOnly /></label><label>Track<input value="Individual contributor" readOnly /></label><label>Squad<input value="Piloto Engineering · demo" readOnly /></label></div>
      <div className="pilot-matrix-context"><div><span className="eyebrow">Matriz oficial · People & Culture</span><strong>{engineeringProfile.role} · nivel esperado {engineeringProfile.expectedLevel}/4</strong><p>Cada nivel incorpora las expectativas del anterior. Las anclas explican el comportamiento esperado; no son una regla automática de promoción.</p></div><div>{engineeringEvaluationTypes.map(type => <span key={type.id} className={session.profilingType === type.id ? "pilot-evaluation-type active" : "pilot-evaluation-type"}><button type="button" onClick={() => session.state === "draft" ? setSession(current => ({ ...current, profilingType: type.id, message: `${type.label} seleccionada para ${engineeringProfile.seniority}.` })) : toast.error("SESSION_NOT_EDITABLE: el tipo se define antes de generar.")}>{type.label}</button><small>{type.owner}</small></span>)}</div></div>
      <div className="pilot-module-grid">{(["values", "competencies"] as ProfilingFlow[]).map(flow => <article className="pilot-card" key={flow}><div className="pilot-card-head"><div><span className="pilot-flow-dot" /><p className="eyebrow">{flow === "values" ? "Valores organizacionales · demo" : "Matriz Engineering · People & Culture"}</p><h3>{flowLabel[flow]}</h3></div>{flow === "competencies" ? <button className="button secondary" onClick={() => applyEngineeringProfile(engineeringProfileId)}><Download size={15} />Restaurar matriz</button> : <button className="button secondary" onClick={() => { setDimensions(current => current.map(dimension => dimension.flow === flow ? { ...dimension, source: "weel_export" } : dimension)); record("Importación demo", `weel_export aplicado a ${flowLabel[flow]}.`); toast.success("Fuente de valores demo actualizada."); }}><Download size={15} />Importar</button>}</div><p className="pilot-card-copy">{flow === "values" ? "Fuente demostrativa: valores no provistos por la matriz de Engineering." : "Fuente oficial: Copia de Matrix Skills · Engineering. Cambiar un campo crea una variante manual de demo."}</p><div className="dimension-list">{dimensions.filter(dimension => dimension.flow === flow).map(dimension => <div className="dimension-row" key={dimension.id}><input value={dimension.name} aria-label={`Nombre de ${dimension.name}`} onChange={event => updateDimension(dimension.id, { name: event.target.value })} /><label>Nivel esperado<select value={dimension.expected} onChange={event => updateDimension(dimension.id, { expected: Number(event.target.value) })}>{[1, 2, 3, 4].map(level => <option key={level} value={level}>{level}</option>)}</select></label><label>Peso<input type="number" min="0.5" max="2" step="0.1" value={dimension.weight} onChange={event => updateDimension(dimension.id, { weight: Number(event.target.value) })} /></label>{dimension.flow === "competencies" && engineeringProfile.anchors[dimension.id] && <p className="pilot-anchor"><strong>Ancla de nivel:</strong> {engineeringProfile.anchors[dimension.id]}</p>}</div>)}</div><button className="pilot-add" onClick={() => createConfigDimension(flow)}><Plus size={15} />Agregar {flow === "values" ? "valor" : "competencia"}</button></article>)}</div>
      <div className="pilot-callout"><Info size={17} /><p><strong>Regla H2.</strong> Cada módulo conserva dimensiones y niveles esperados propios. Las cuatro competencias de Engineering y sus anclas provienen de la matriz compartida por People & Culture; los valores continúan explícitamente en modo demostrativo.</p></div>
    </section>}

    {tab === "sessions" && <PilotSessionsPanel session={session} submitted={submitted} onCreate={() => setTab("session")} onReview={() => setTab("hitl")} />}

    {tab === "session" && <section className="pilot-stack"><div className="pilot-heading"><div><p className="eyebrow">H3–H4 · Sesión y resiliencia</p><h2>Crear un instrumento revisable</h2><p>El pipeline es secuencial: borrador → generación → revisión humana → aprobación → distribución.</p></div><span className={`pilot-state ${session.state}`}>{statusCopy(session.state)}</span></div><div className="pilot-creation-rail" aria-label="Bloques de creación de sesión"><span><b>01</b>Propósito</span><span><b>02</b>Participantes</span><span><b>03</b>Instrumento</span><span><b>04</b>Confirmación</span></div><div className="pilot-session-grid"><article className="pilot-card"><h3>Propósito e instrumento</h3><label>Nombre<input value={session.name} onChange={event => setSession(current => ({ ...current, name: event.target.value }))} /></label><label>Tipo<select value={session.profilingType} onChange={event => setSession(current => ({ ...current, profilingType: event.target.value as ProfilingType }))}>{Object.entries(sessionTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Extensión<select value={session.extension} onChange={event => setSession(current => ({ ...current, extension: event.target.value as SessionExtension }))}>{Object.entries(extensionDefinitions).map(([value, definition]) => <option key={value} value={value}>{definition.label} · {definition.duration} · {definition.questions}</option>)}</select></label><label>Participantes<input type="number" min="1" max="12" value={session.participants} onChange={event => setSession(current => ({ ...current, participants: Number(event.target.value) }))} /></label><div className="pilot-flow-toggle">{(["values", "competencies"] as ProfilingFlow[]).map(flow => <label key={flow}><input type="checkbox" checked={session.activeFlows.includes(flow)} onChange={() => setSession(current => ({ ...current, activeFlows: current.activeFlows.includes(flow) ? current.activeFlows.filter(item => item !== flow) : [...current.activeFlows, flow] }))} />{flowLabel[flow]}</label>)}</div><label className="pilot-switch"><input type="checkbox" checked={simulateDegraded} onChange={event => setSimulateDegraded(event.target.checked)} />Simular indisponibilidad del generador</label><button className="button primary full" disabled={session.state === "generating" || !session.activeFlows.length} onClick={() => generate()}>{session.state === "generating" ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}Generar borrador</button></article><article className="pilot-card pilot-session-status"><span className="pilot-number">{String(session.attempt).padStart(2, "0")}</span><p>Intentos de generación</p><h3>{session.message}</h3><div className="pilot-origin"><span>Origen</span><strong>{session.origin}</strong><span>Estado</span><strong>{session.generationStatus}</strong></div>{session.state === "generation_degraded" && <div className="pilot-degraded"><AlertTriangle size={19} /><div><strong>Continuá sin bloqueo.</strong><p>Elegí una alternativa revisable; no hay borrador inventado.</p></div><div><button className="button secondary" onClick={useTemplate}>Usar matriz oficial</button><button className="button secondary" onClick={useManual}>Crear manual</button><button className="button subtle" onClick={() => generate(false)}><RefreshCw size={14} />Reintentar</button></div></div>}{session.state === "generation_failed" && <button className="button secondary" onClick={useManual}>Crear manual</button>}<div className="pilot-state-path"><span className={session.state === "draft" ? "current" : ""}>Borrador</span><ArrowRight size={14} /><span className={session.state === "in_review" ? "current" : ""}>HITL</span><ArrowRight size={14} /><span className={session.state === "approved" ? "current" : ""}>Aprobada</span><ArrowRight size={14} /><span className={session.state === "active" ? "current" : ""}>Distribuida</span></div></article></div></section>}

    {tab === "hitl" && <section className="pilot-stack"><div className="pilot-heading"><div><p className="eyebrow">H5 · Human in the loop</p><h2>Revisión con trazabilidad e invariantes</h2><p>Los tres orígenes —IA, plantilla y manual— se someten a la misma aprobación.</p></div><span className="pilot-state">{statusCopy(session.state)}</span></div>{!["in_review", "approved", "active"].includes(session.state) && <div className="pilot-callout warning"><AlertTriangle size={17} /><p>Generá un borrador o aplicá una alternativa desde H3–H4 para comenzar la revisión.</p></div>}<div className="pilot-hitl-grid"><article className="pilot-card"><div className="pilot-card-head"><div><h3>Preguntas del cuestionario</h3><p>{session.questions.length} preguntas · origen {session.origin}</p></div><button className="button secondary" disabled={["approved", "active"].includes(session.state)} onClick={addQuestion}><Plus size={15} />Agregar</button></div>{session.questions.length === 0 ? <div className="pilot-empty"><FileQuestion size={24} /><p>No hay preguntas. Agregá una por cada flujo activo antes de aprobar.</p></div> : <div className="pilot-question-list">{session.questions.map((question, index) => <article className="pilot-question-editor" key={question.id}><div className="pilot-question-index">{String(index + 1).padStart(2, "0")}</div><div><div className="pilot-question-controls"><select value={question.flow} disabled={["approved", "active"].includes(session.state)} onChange={event => updateQuestion(question.id, { flow: event.target.value as ProfilingFlow })}>{(["values", "competencies"] as ProfilingFlow[]).map(flow => <option key={flow} value={flow}>{flowLabel[flow]}</option>)}</select><select value={question.dimensionId} disabled={["approved", "active"].includes(session.state)} onChange={event => updateQuestion(question.id, { dimensionId: event.target.value })}>{activeDimensions.filter(dimension => dimension.flow === question.flow).map(dimension => <option key={dimension.id} value={dimension.id}>{dimension.name}</option>)}</select><select value={question.type} disabled={["approved", "active"].includes(session.state)} onChange={event => updateQuestion(question.id, { type: event.target.value as QuestionType })}>{Object.entries(questionTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><label>Peso<input type="number" disabled={["approved", "active"].includes(session.state)} min="0.5" max="2" step="0.1" value={question.weight} onChange={event => updateQuestion(question.id, { weight: Number(event.target.value) })} /></label></div><textarea value={question.prompt} disabled={["approved", "active"].includes(session.state)} onChange={event => updateQuestion(question.id, { prompt: event.target.value })} aria-label={`Texto pregunta ${index + 1}`} />{question.type === "practical_scenario" && <label className="pilot-rubric">Rúbrica obligatoria<textarea value={question.rubric ?? ""} disabled={["approved", "active"].includes(session.state)} onChange={event => updateQuestion(question.id, { rubric: event.target.value })} /></label>}<div className="pilot-question-actions"><span>{question.required ? "Obligatoria" : "Opcional"}</span><button disabled={["approved", "active"].includes(session.state)} onClick={() => { const next = { ...question, prompt: `${question.prompt} (versión regenerada)`, rubric: question.type === "practical_scenario" ? question.rubric || "Evalúa contexto, evidencia, decisión y resultado." : question.rubric }; updateQuestion(question.id, next); record("Pregunta regenerada", `Pregunta ${index + 1} regenerada con dimensión conservada.`); toast.success("Pregunta regenerada y registrada."); }}><RefreshCw size={14} />Regenerar</button><button className="danger" disabled={["approved", "active"].includes(session.state)} onClick={() => { setSession(current => ({ ...current, questions: current.questions.filter(item => item.id !== question.id) })); record("Pregunta eliminada", `Pregunta ${index + 1} eliminada en HITL.`); }}>Eliminar</button></div></div></article>)}</div>}<div className="pilot-hitl-actions"><button className="button primary" disabled={session.state !== "in_review"} onClick={approve}><Check size={16} />Aprobar cuestionario</button><button className="button secondary" disabled={session.state !== "approved"} onClick={distribute}><Send size={16} />Distribuir a {session.participants}</button></div>{sessionErrors.length > 0 && session.state === "in_review" && <div className="pilot-errors">{sessionErrors.map(error => <p key={`${error.code}-${error.detail}`}><X size={14} />{error.detail}</p>)}</div>}</article><aside className="pilot-card pilot-audit"><h3>Audit trail demo</h3>{audit.map(entry => <div key={entry.id}><span>{entry.timestamp}</span><strong>{entry.action}</strong><p>{entry.detail}</p></div>)}</aside></div></section>}

    {tab === "assessment" && <section className="pilot-stack"><div className="pilot-heading"><div><p className="eyebrow">H6 · Autoevaluación</p><h2>Responder, guardar y enviar una sola vez</h2><p>Vista Colaborador simulada sin autenticación. La evaluación permanece inmutable después del envío.</p></div><span className={`pilot-state ${submitted ? "approved" : session.state}`}>{submitted ? "Enviada" : statusCopy(session.state)}</span></div>{session.state !== "active" && <div className="pilot-callout warning"><AlertTriangle size={17} /><p>La evaluación se habilita al distribuir una sesión aprobada. Completá H3–H5 para activar este recorrido.</p></div>}{session.state === "active" && <article className="pilot-assessment"><div className="pilot-callout"><Info size={17} /><p>{restoredProgress ? "Progreso recuperado desde este navegador de demo. " : "El progreso se guarda localmente en este navegador de demo. "}{lastSavedAt ? `Último guardado: ${new Date(lastSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.` : "Las respuestas parciales se guardarán al comenzar a responder."} Al enviar, el borrador local se elimina y las respuestas quedan inmutables.</p></div><div className="pilot-assessment-head"><div><span>Colaborador demo</span><h3>{demoEmployee.name} · {demoEmployee.role}</h3><p>{session.name} · {extensionDefinitions[session.extension].duration}</p></div><span>{Object.values(responses).filter(value => scoreResponse(value) !== null).length}/{session.questions.length} respondidas</span></div>{submitted ? <div className="pilot-submitted"><Check size={28} /><h3>Autoevaluación enviada</h3><p>AssessmentSubmitted registrado. Las respuestas ya no pueden editarse y el borrador local fue eliminado.</p><button className="button primary" onClick={() => setTab("report")}>Ver mi reporte <ArrowRight size={16} /></button></div> : <div className="pilot-response-list">{session.questions.map((question, index) => <fieldset key={question.id}><legend><span>{index + 1}</span><div><small>{flowLabel[question.flow]} · {questionTypeLabels[question.type]} · peso {question.weight}</small>{question.prompt}{question.required && <em>Obligatoria</em>}</div></legend>{inputAnswer(question, responses[question.id], value => setResponses(current => ({ ...current, [question.id]: value })))}</fieldset>)}<div className="pilot-assessment-footer"><button className="button secondary" onClick={() => { const snapshot = persistAssessmentProgress(getBrowserLocalStorage(), { sessionId: session.id, participantId: demoEmployee.id, session, dimensions, responses }); if (!snapshot) return toast.error("LOCAL_STORAGE_UNAVAILABLE: no se pudo guardar el progreso en este navegador."); setLastSavedAt(snapshot.savedAt); record("Progreso guardado", `${Object.keys(responses).length} respuestas parciales guardadas localmente para H6.`); toast.success("Progreso guardado localmente. Podés recargar y retomarlo en este navegador."); }}>Guardar y continuar después</button><button className="button primary" onClick={submitAssessment}>Enviar respuestas <Send size={16} /></button></div></div>}</article>}</section>}

    {tab === "report" && <CollaboratorReportPanel diagnosis={diagnosis} isReady={submitted} onReturnToAssessment={() => setTab("assessment")} />}

    {tab === "diagnosis" && <section className="pilot-stack"><div className="pilot-heading"><div><p className="eyebrow">H7 · Diagnóstico individual</p><h2>Gap esperado − real, explicado por flujo</h2><p>La tolerancia de 3 % equivale a 0,12 puntos en la escala 1–4. El resultado orienta conversaciones de desarrollo.</p></div><span className="pilot-tolerance">Tolerancia ±0,12</span></div>{!submitted ? <div className="pilot-empty pilot-card"><Gauge size={28} /><h3>DIAGNOSIS_NOT_READY</h3><p>El diagnóstico se habilita cuando la autoevaluación está enviada y el scoring determinístico termina.</p><button className="button primary" onClick={() => setTab("assessment")}>Ir a autoevaluación</button></div> : <><div className="pilot-flow-selector">{(["values", "competencies"] as ProfilingFlow[]).map(flow => <button className={selectedFlow === flow ? "active" : ""} key={flow} onClick={() => setSelectedFlow(flow)}>{flowLabel[flow]}</button>)}</div><div className="pilot-diagnosis-grid"><article className="pilot-card"><div className="pilot-card-head"><div><h3>Radar de {flowLabel[selectedFlow]}</h3><p>Nivel real versus esperado por dimensión.</p></div></div><div className="pilot-radar"><ResponsiveContainer width="100%" height="100%"><RadarChart data={diagnosis.flows.find(flow => flow.flow === selectedFlow)?.dimensions.map(item => ({ label: item.name, real: item.actual, esperado: item.expected })) ?? []}><PolarGrid /><PolarAngleAxis dataKey="label" tick={{ fontSize: 10, fill: "#4c6157" }} /><Radar dataKey="real" name="Real" stroke="#2baf84" fill="#2baf84" fillOpacity={0.25} /><Radar dataKey="esperado" name="Esperado" stroke="#7656d6" fill="#7656d6" fillOpacity={0.08} /></RadarChart></ResponsiveContainer></div></article><article className="pilot-card"><h3>Lectura de semáforo</h3><div className="pilot-legend"><span className="critical">Brecha crítica</span><span className="acceptable">Nivel aceptable</span><span className="outstanding">Talento destacado</span></div><p className="pilot-card-copy">El estado destacado es una señal para conversación de mentoría o crecimiento; no es una promoción automática.</p><div className="pilot-stat-row"><strong>{diagnosis.flows.find(flow => flow.flow === selectedFlow)?.dimensions.filter(item => item.status === "critical_gap").length ?? 0}</strong><span>brechas prioritarias</span></div></article></div><article className="pilot-card"><div className="pilot-card-head"><div><h3>Detalle por dimensión</h3><p>Resultado reproducible con pesos y escala comunes.</p></div></div><div className="pilot-diagnosis-table-wrap"><table className="pilot-diagnosis-table"><thead><tr><th>Dimensión</th><th>Esperado</th><th>Real</th><th>Gap</th><th>Estado</th></tr></thead><tbody>{diagnosis.flows.find(flow => flow.flow === selectedFlow)?.dimensions.map(item => <tr key={item.id}><th>{item.name}</th><td>{item.expected.toFixed(2)}</td><td>{item.actual.toFixed(2)}</td><td>{item.gap.toFixed(2)}</td><td><span className={`pilot-diagnosis-status ${item.status}`}>{item.status === "critical_gap" ? "Brecha crítica" : item.status === "outstanding" ? "Talento destacado" : "Nivel aceptable"}</span></td></tr>)}</tbody></table></div></article></>}</section>}

    {tab === "contract" && <section className="pilot-stack"><div className="pilot-heading"><div><p className="eyebrow">H8 · Contract-first</p><h2>OpenAPI de la demo</h2><p>Contrato REST navegable para el piloto, sin autenticación operativa por exclusión explícita de H1.</p></div><a className="button primary" href="/api/v1/openapi.json" target="_blank" rel="noreferrer"><FileQuestion size={16} />Abrir OpenAPI</a></div><div className="pilot-contract-grid"><article className="pilot-card"><h3>Endpoints documentados</h3><ul><li><code>GET /api/v1/openapi.json</code></li><li><code>POST /api/v1/sessions</code></li><li><code>PATCH /api/v1/sessions/{'{id}'}/hitl/questions/{'{qid}'}</code></li><li><code>POST /api/v1/sessions/{'{id}'}/hitl/approve</code></li><li><code>POST /api/v1/assessments/{'{id}'}/submit</code></li><li><code>GET /api/v1/diagnosis/{'{assessment_id}'}</code></li></ul></article><article className="pilot-card"><h3>Decisión de seguridad</h3><p>El contrato incluye el esquema Bearer JWT como referencia futura, pero sus rutas están marcadas como <strong>demo sin autenticación</strong> hasta integrar Okta.</p><p className="pilot-card-copy">También documenta errores de negocio, estados de sesión, estados de generación y orígenes de cuestionario para reducir drift en F2.</p></article></div><div className="pilot-callout"><ShieldCheck size={17} /><p><strong>Preparado para integración.</strong> El contrato muestra un modo de demo controlado; la autorización real se implementará del lado del servidor al activar H1/Okta.</p></div></section>}

    {!showCollaboratorExperience && tab !== "contract" && <footer className="pilot-flow-footer" aria-label="Navegación del flujo de Talento"><button type="button" disabled={talentStepIndex <= 0} onClick={() => setTab(talentNavigation[Math.max(0, talentStepIndex - 1)].id)}>Anterior</button><div><span>Paso {talentStepIndex + 1} de {talentNavigation.length}</span><strong>{talentNavigation[talentStepIndex].label}</strong></div><button type="button" disabled={talentStepIndex >= talentNavigation.length - 1} onClick={() => setTab(talentNavigation[Math.min(talentNavigation.length - 1, talentStepIndex + 1)].id)}>Continuar</button></footer>}
      </main>
    </div>
  </div>;
}
