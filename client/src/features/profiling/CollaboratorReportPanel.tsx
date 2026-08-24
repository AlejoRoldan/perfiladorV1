import { ArrowRight, Check, Compass, Sparkles } from "lucide-react";
import { buildDiagnosis } from "./pilotEngine";

type Diagnosis = ReturnType<typeof buildDiagnosis>;

export function CollaboratorReportPanel({ diagnosis, isReady, onReturnToAssessment }: { diagnosis: Diagnosis; isReady: boolean; onReturnToAssessment: () => void }) {
  const dimensions = diagnosis.flows.flatMap(flow => flow.dimensions.map(dimension => ({ ...dimension, flow: flow.flow })));
  const strengths = dimensions.filter(dimension => dimension.status === "outstanding");
  const priorities = dimensions.filter(dimension => dimension.status === "critical_gap");
  const nextLevel = priorities.length > 0 ? priorities : dimensions.filter(dimension => dimension.status === "acceptable");

  if (!isReady) return <section className="pilot-stack"><div className="pilot-heading"><div><p className="eyebrow">Mi reporte de desarrollo</p><h2>Tu reporte estará disponible al finalizar</h2><p>Este espacio traduce tus respuestas en una conversación personal de desarrollo. No sustituye una revisión de desempeño ni toma decisiones de carrera.</p></div></div><article className="pilot-card pilot-empty"><Compass size={28} /><h3>REPORTE_AÚN_NO_DISPONIBLE</h3><p>Completá y enviá la autoevaluación para ver fortalezas, focos de práctica y el siguiente nivel esperado.</p><button className="button primary" type="button" onClick={onReturnToAssessment}>Ir a autoevaluación <ArrowRight size={16} /></button></article></section>;

  return <section className="pilot-stack" aria-labelledby="collaborator-report-title">
    <div className="pilot-heading"><div><p className="eyebrow">Mi reporte de desarrollo</p><h2 id="collaborator-report-title">Aprendizajes para tu próximo paso</h2><p>Leé el resultado como una guía para priorizar práctica, evidencia y conversaciones de crecimiento. No constituye una calificación de desempeño.</p></div><span className="pilot-state approved">Reporte listo</span></div>
    <div className="pilot-report-grid">
      <article className="pilot-card"><div className="pilot-card-head"><div><h3>Fortalezas observadas</h3><p>Dimensiones por encima del nivel esperado con la tolerancia del piloto.</p></div><Check size={18} /></div><div className="pilot-report-list">{strengths.length > 0 ? strengths.map(item => <div key={item.id}><strong>{item.name}</strong><span>{item.flow === "values" ? "Valores" : "Competencias"} · {item.actual.toFixed(2)}/4</span></div>) : <p>Tu resultado se encuentra en rango esperado. Consolidá evidencia de impacto antes de buscar un siguiente desafío.</p>}</div></article>
      <article className="pilot-card"><div className="pilot-card-head"><div><h3>Siguiente nivel</h3><p>Priorizá una dimensión por ciclo de desarrollo.</p></div><Compass size={18} /></div><div className="pilot-report-list">{nextLevel.slice(0, 3).map(item => <div key={item.id}><strong>{item.name}</strong><span>Actual {item.actual.toFixed(2)} · esperado {item.expected.toFixed(2)} · gap {item.gap.toFixed(2)}</span></div>)}</div></article>
    </div>
    <article className="pilot-card pilot-development-practice"><div><p className="eyebrow">Práctica sugerida</p><h3>Convertí el resultado en evidencia de aprendizaje</h3><p>Elegí una fortaleza para compartir con tu equipo y una dimensión de foco para practicar en una tarea real. Acordá con tu líder una evidencia concreta y una fecha de revisión.</p></div><Sparkles size={24} /></article>
    <div className="pilot-callout"><Check size={17} /><p><strong>Cierre seguro.</strong> Tus respuestas quedan inmutables después del envío. Este reporte utiliza el mismo cálculo explicable del piloto y debe ser acompañado por una conversación humana.</p></div>
  </section>;
}
