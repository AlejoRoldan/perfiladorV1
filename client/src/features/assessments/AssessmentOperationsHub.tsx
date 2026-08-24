import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ClipboardCheck, FileBarChart2, FileCheck2, Loader2, ShieldCheck, UserRoundCheck, UsersRound } from "lucide-react";
import type { AccessRole } from "@shared/accessControl";
import { trpc } from "@/lib/trpc";
import PersistentInstrumentBuilder from "./PersistentInstrumentBuilder";
import PersistentEvaluationCycle from "./PersistentEvaluationCycle";
import PersistentResultsDashboard from "./PersistentResultsDashboard";

type Scope = { tenantId: string; pilotId: string };

type Stage = {
  number: string;
  title: string;
  description: string;
  status: string;
  tone: "ready" | "waiting" | "locked";
};

type AssessmentAction = "instrument" | "operation" | "results";

export default function AssessmentOperationsHub({ accessRole, onOpenPilot, initialAction }: { accessRole: AccessRole; onOpenPilot: () => void; initialAction?: AssessmentAction }) {
  const pilots = trpc.pilot.listAccessible.useQuery();
  const [scope, setScope] = useState<Scope | null>(null);
  const requestedAction = initialAction ?? new URLSearchParams(window.location.search).get("assessmentAction");
  const [showInstrumentBuilder, setShowInstrumentBuilder] = useState(() => requestedAction === "instrument");
  const [showEvaluationCycle, setShowEvaluationCycle] = useState(() => requestedAction === "operation");
  const [showResults, setShowResults] = useState(() => requestedAction === "results");

  useEffect(() => {
    if (!scope && pilots.data?.[0]) setScope({ tenantId: pilots.data[0].tenantId, pilotId: pilots.data[0].pilotId });
  }, [pilots.data, scope]);

  const workspace = trpc.pilot.workspace.useQuery(scope ?? { tenantId: "unselected", pilotId: "unselected" }, { enabled: Boolean(scope) });
  const canManage = accessRole === "admin" || accessRole === "people_ops";
  const current = workspace.data;
  const stages = useMemo<Stage[]>(() => {
    const participants = current?.participants.length ?? 0;
    const instruments = current?.instruments.length ?? 0;
    const campaigns = current?.campaigns.length ?? 0;
    const hasPopulation = participants > 0;
    const hasInstrument = instruments > 0;
    const hasCampaign = campaigns > 0;
    return [
      { number: "01", title: "Población", description: "Participantes vinculados al piloto y a su identidad autorizada.", status: `${participants} registrados`, tone: hasPopulation ? "ready" : "waiting" },
      { number: "02", title: "Instrumento", description: "Versión aprobada con matriz, escala, reglas y checksum preservados.", status: `${instruments} aprobados`, tone: hasInstrument ? "ready" : "waiting" },
      { number: "03", title: "Campaña", description: "Ventana, responsables y recordatorios vinculados al alcance del piloto.", status: `${campaigns} configuradas`, tone: hasCampaign ? "ready" : "waiting" },
      { number: "04", title: "Respuesta", description: "Asignación individual, borrador en servidor y envío definitivo del colaborador.", status: hasPopulation && hasInstrument && hasCampaign ? "Siguiente operación" : "Requiere pasos 01–03", tone: hasPopulation && hasInstrument && hasCampaign ? "ready" : "locked" },
      { number: "05", title: "Revisión y diagnóstico", description: "Cálculo versionado, revisión humana y devolución con trazabilidad.", status: hasPopulation && hasInstrument && hasCampaign ? "Disponible al recibir envíos" : "Aún no habilitado", tone: "locked" },
      { number: "06", title: "Resultados", description: "Seguimiento agregado, detalle por código de reporte y exportación trazable.", status: hasCampaign ? "Disponible para People & Culture" : "Requiere una campaña", tone: hasCampaign ? "ready" : "locked" },
    ];
  }, [current]);

  if (pilots.isLoading || (scope && workspace.isLoading)) return <section className="assessment-ops-state"><Loader2 className="spin" size={22} /><div><strong>Cargando el ciclo real del piloto…</strong><p>Verificando tenant, piloto y permisos de acceso.</p></div></section>;

  if (pilots.error || workspace.error) return <section className="assessment-ops-state error"><ShieldCheck size={24} /><div><strong>No fue posible cargar el ciclo de evaluación.</strong><p>{pilots.error?.message ?? workspace.error?.message}</p><button className="button secondary" onClick={onOpenPilot}>Revisar acceso al piloto</button></div></section>;

  if (!current) return <section className="assessment-ops-empty"><ClipboardCheck size={28} /><p className="eyebrow">Ciclo de evaluación</p><h1>No hay un piloto real disponible para tu identidad.</h1><p>Las pantallas de campaña y plantilla demo fueron retiradas de esta ruta. Antes de evaluar, debe existir un workspace persistente y autorizado.</p>{canManage && <button className="button primary" onClick={onOpenPilot}>Abrir workspace del piloto <ArrowRight size={16} /></button>}</section>;

  if (showInstrumentBuilder && scope) return <PersistentInstrumentBuilder scope={scope} onBack={() => setShowInstrumentBuilder(false)} />;
  if (showEvaluationCycle && scope) return <PersistentEvaluationCycle accessRole={accessRole} scope={scope} onBack={() => setShowEvaluationCycle(false)} />;
  if (showResults && scope && canManage) return <PersistentResultsDashboard scope={scope} onBack={() => setShowResults(false)} />;

  const nextStage = stages.find(stage => stage.tone !== "ready");
  return <div className="view-stack assessment-ops">
    <section className="assessment-ops-hero">
      <div>
        <p className="eyebrow">Ciclo de evaluación · datos reales</p>
        <h1>Del instrumento aprobado al diagnóstico revisado.</h1>
        <p>Este tablero muestra únicamente el estado del piloto persistente autorizado. Cada paso se completa en orden para evitar campañas sin población, instrumentos sin versión o resultados sin revisión humana.</p>
      </div>
      <div className="assessment-ops-scope"><small>Piloto activo</small><strong>{current.pilot.name}</strong><span>{current.pilot.status === "draft" ? "Borrador protegido" : current.pilot.status}</span></div>
    </section>

    <section className="assessment-ops-next" aria-label="Siguiente acción del ciclo">
      <div className="assessment-ops-next-icon"><UserRoundCheck size={19} /></div>
      <div><small>Siguiente paso operativo</small><strong>{nextStage ? `${nextStage.number} · ${nextStage.title}` : "Ciclo configurado"}</strong><p>{nextStage?.description ?? "La configuración inicial está completa; revisá las asignaciones y respuestas pendientes."}</p></div>
      <button className="button primary" onClick={canManage && nextStage?.title === "Instrumento" ? () => setShowInstrumentBuilder(true) : () => setShowEvaluationCycle(true)}>{canManage && nextStage?.title === "Instrumento" ? "Configurar instrumento" : canManage ? "Operar campaña" : "Ver mis evaluaciones"}<ArrowRight size={16} /></button>
    </section>

    <section className="assessment-ops-journey" aria-label="Etapas del ciclo de evaluación">
      {stages.map((stage, index) => <article className={`assessment-stage ${stage.tone}`} key={stage.number}>
        <div className="assessment-stage-order"><span>{stage.number}</span>{index < stages.length - 1 && <i aria-hidden="true" />}</div>
        <div><h2>{stage.title}</h2><p>{stage.description}</p><span className="assessment-stage-status">{stage.tone === "ready" ? <FileCheck2 size={14} /> : <ClipboardCheck size={14} />}{stage.status}</span></div>
      </article>)}
    </section>

    <section className="assessment-ops-grid">
      <article className="data-panel assessment-ops-facts"><div className="panel-header"><div><p className="eyebrow">Alcance protegido</p><h2>Estado del piloto</h2><p>Los contadores se obtienen del repositorio aislado, no de datos de demostración.</p></div><ShieldCheck size={20} /></div><dl><div><dt><UsersRound size={16} />Participantes</dt><dd>{current.participants.length}</dd></div><div><dt><FileCheck2 size={16} />Instrumentos</dt><dd>{current.instruments.length}</dd></div><div><dt><ClipboardCheck size={16} />Campañas</dt><dd>{current.campaigns.length}</dd></div></dl></article>
      <article className="data-panel assessment-ops-guard"><ShieldCheck size={22} /><div><h2>Registros reales, sin simulaciones</h2><p>Las campañas, asignaciones, respuestas y diagnósticos se guardan con claves de tenant, piloto y participante. El diagnóstico se habilita solo tras el envío y requiere una acción explícita de People & Culture.</p><button className="button tertiary" onClick={() => setShowEvaluationCycle(true)}>Abrir operación persistente <ArrowRight size={15} /></button></div></article>
      {canManage && <article className="data-panel assessment-ops-guard assessment-results-link"><FileBarChart2 size={22} /><div><h2>Resultados y exportación</h2><p>Consulta progreso, diagnósticos calculados y descarga un CSV con datos mínimos, alcance autorizado y finalidad registrada.</p><button className="button tertiary" onClick={() => setShowResults(true)}>Abrir panel de resultados <ArrowRight size={15} /></button></div></article>}
    </section>
  </div>;
}
