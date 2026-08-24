import { ArrowRight, CheckCircle2, Clock3, FileText, Users } from "lucide-react";
import type { PilotSession } from "./pilotDomain";
import "./talentStartPanel.css";

type TalentDestination = "config" | "sessions" | "session" | "hitl" | "diagnosis";

export function TalentStartPanel({ session, onNavigate }: { session: PilotSession; onNavigate: (destination: TalentDestination) => void }) {
  const sessionLabel = ({ draft: "Borrador", generating: "Generando", in_review: "En revisión", generation_degraded: "Alternativa requerida", generation_failed: "Generación fallida", approved: "Aprobada", active: "Distribuida", closed: "Vencida" })[session.state];
  const nextDestination: TalentDestination = session.state === "draft" ? "session" : ["in_review", "approved", "active"].includes(session.state) ? "hitl" : "session";

  return <section className="talent-start-panel" aria-labelledby="talent-start-title">
    <div className="talent-start-heading">
      <div><span className="eyebrow">Inicio · Diagnósticos</span><h2 id="talent-start-title">Una vista operativa del piloto</h2><p>Revisá el estado de la sesión, completá la configuración y llevá el instrumento por un pipeline con intervención humana.</p></div>
      <button className="button primary" type="button" onClick={() => onNavigate("session")}><FileText size={16} /><span className="talent-create-label">Crear sesión</span><ArrowRight size={16} /></button>
    </div>
    <div className="talent-start-metrics">
      <article><span><Users size={17} />Participantes</span><strong>{session.participants}</strong><small>Asignación prevista para esta sesión</small></article>
      <article><span><Clock3 size={17} />Estado</span><strong>{sessionLabel}</strong><small>Pipeline: borrador → revisión → distribución</small></article>
      <article><span><CheckCircle2 size={17} />Diagnóstico</span><strong>{session.state === "active" ? "Disponible al enviar" : "Pendiente"}</strong><small>Separado por valores y competencias</small></article>
    </div>
    <div className="talent-start-actions" aria-label="Acciones principales de Talento">
      <button type="button" onClick={() => onNavigate("config")}><span>01</span><div><strong>Configurar matriz</strong><small>Valores, competencias y contexto</small></div><ArrowRight size={16} /></button>
      <button type="button" onClick={() => onNavigate("sessions")}><span>02</span><div><strong>Sesiones</strong><small>Pipeline, participantes e instrumento</small></div><ArrowRight size={16} /></button>
      <button type="button" onClick={() => onNavigate(nextDestination)}><span>03</span><div><strong>Revisar y avanzar</strong><small>HITL antes de distribuir</small></div><ArrowRight size={16} /></button>
      <button type="button" onClick={() => onNavigate("diagnosis")}><span>04</span><div><strong>Diagnósticos</strong><small>Brechas, cobertura y recomendaciones</small></div><ArrowRight size={16} /></button>
    </div>
  </section>;
}
