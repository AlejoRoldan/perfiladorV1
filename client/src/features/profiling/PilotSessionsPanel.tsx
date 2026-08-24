import { ArrowRight, FileQuestion, Sparkles } from "lucide-react";
import { sessionTypeLabels, type PilotSession } from "./pilotDomain";

type SessionPipelineState = "Borrador" | "Generando" | "En revisión" | "Distribuida" | "Completada" | "Vencida";

export function getPipelineState(session: PilotSession, submitted: boolean): SessionPipelineState {
  if (submitted) return "Completada";
  if (session.state === "closed") return "Vencida";
  if (session.state === "active") return "Distribuida";
  if (session.state === "in_review" || session.state === "approved") return "En revisión";
  if (["generating", "generation_degraded", "generation_failed"].includes(session.state)) return "Generando";
  return "Borrador";
}

const pipeline: SessionPipelineState[] = ["Borrador", "Generando", "En revisión", "Distribuida", "Completada", "Vencida"];

export function PilotSessionsPanel({ session, submitted, onCreate, onReview }: { session: PilotSession; submitted: boolean; onCreate: () => void; onReview: () => void }) {
  const currentState = getPipelineState(session, submitted);
  const currentIndex = pipeline.indexOf(currentState);

  return <section className="pilot-stack" aria-labelledby="pilot-sessions-title">
    <div className="pilot-heading">
      <div><p className="eyebrow">Sesiones · pipeline del piloto</p><h2 id="pilot-sessions-title">Sesiones de perfilamiento</h2><p>Revisá el estado operativo de cada instrumento antes de abrir, aprobar o distribuir. Los estados se expresan en lenguaje de proceso, no en términos técnicos.</p></div>
      <button className="button primary" type="button" onClick={onCreate}><Sparkles size={16} />Crear sesión</button>
    </div>
    <article className="pilot-card pilot-session-list-card">
      <div className="pilot-card-head"><div><p className="eyebrow">Sesión actual</p><h3>{session.name}</h3><p>{sessionTypeLabels[session.profilingType]} · {session.participants} participantes · {session.questions.length} preguntas</p></div><span className={`pilot-state ${session.state}`}>{currentState}</span></div>
      <ol className="pilot-session-pipeline" aria-label={`Pipeline actual: ${currentState}`}>
        {pipeline.map((state, index) => <li key={state} className={index < currentIndex ? "complete" : index === currentIndex ? "current" : ""}><span>{String(index + 1).padStart(2, "0")}</span><strong>{state}</strong></li>)}
      </ol>
      <div className="pilot-session-list-meta"><div><span>Origen del instrumento</span><strong>{session.origin}</strong></div><div><span>Flujos activos</span><strong>{session.activeFlows.length === 2 ? "Valores y competencias" : session.activeFlows[0] === "values" ? "Valores" : "Competencias"}</strong></div><div><span>Mensaje operativo</span><strong>{session.message}</strong></div></div>
      <div className="pilot-session-list-actions"><button className="button secondary" type="button" onClick={onCreate}><FileQuestion size={16} />Editar creación</button><button className="button primary" type="button" onClick={onReview}>Abrir revisión <ArrowRight size={16} /></button></div>
    </article>
    <div className="pilot-callout"><FileQuestion size={17} /><p><strong>Regla de operación.</strong> La demo representa una sesión activa del piloto. En producción, este listado será alimentado por las sesiones persistidas y sus participantes reales, manteniendo la misma semántica de pipeline.</p></div>
  </section>;
}
