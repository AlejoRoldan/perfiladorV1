import { useMemo, useState } from "react";
import { ArrowLeft, Download, FileBarChart2, Loader2, LockKeyhole, ShieldCheck, SlidersHorizontal, UsersRound } from "lucide-react";
import { trpc } from "@/lib/trpc";
import "./persistentResultsDashboard.css";

type Scope = { tenantId: string; pilotId: string };

const formatDateTime = (value: Date | null) => value ? new Intl.DateTimeFormat("es-PY", { dateStyle: "medium", timeStyle: "short" }).format(value) : "—";
const percentage = (value: number) => `${Math.round(value * 100)}%`;

export default function PersistentResultsDashboard({ scope, onBack }: { scope: Scope; onBack: () => void }) {
  const [campaignValue, setCampaignValue] = useState("all");
  const [purpose, setPurpose] = useState("Seguimiento operativo de resultados del piloto");
  const campaignId = campaignValue === "all" ? undefined : Number(campaignValue);
  const input = useMemo(() => ({ ...scope, ...(campaignId ? { campaignId } : {}) }), [scope, campaignId]);
  const dashboard = trpc.pilot.resultsDashboard.useQuery(input);

  const exportResults = trpc.pilot.exportResults.useMutation({
    onSuccess: data => {
      const blob = new Blob(["\uFEFF", data.content], { type: data.contentType });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = data.filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    },
  });

  if (dashboard.isLoading) return <section className="results-state"><Loader2 className="spin" size={22} /><div><strong>Cargando resultados persistidos…</strong><p>Verificando el alcance del piloto y las evaluaciones registradas.</p></div></section>;
  if (dashboard.error || !dashboard.data) return <section className="results-state error"><ShieldCheck size={22} /><div><strong>No fue posible consultar resultados.</strong><p>{dashboard.error?.message ?? "La información no está disponible."}</p><button className="button secondary" onClick={onBack}>Volver al ciclo</button></div></section>;

  const { summary, campaigns, records } = dashboard.data;
  const canExport = purpose.trim().length >= 8 && !exportResults.isPending;
  return <div className="view-stack persistent-results">
    <section className="results-hero">
      <button className="back-action" onClick={onBack}><ArrowLeft size={16} /> Ciclo de evaluación</button>
      <div className="results-hero-copy"><p className="eyebrow">Resultados · datos persistidos</p><h1>Seguimiento verificable de las evaluaciones.</h1><p>El panel consulta campañas, asignaciones, envíos y diagnósticos desde la base aislada del piloto. Los nombres no se exponen: el seguimiento usa códigos de reporte.</p></div>
      <div className="results-scope"><LockKeyhole size={17} /><div><small>Alcance activo</small><strong>Tenant y piloto autorizados</strong><span>Acceso People & Culture</span></div></div>
    </section>

    <section className="results-controls" aria-label="Filtros y exportación de resultados">
      <label><SlidersHorizontal size={16} /><span>Campaña</span><select value={campaignValue} onChange={event => setCampaignValue(event.target.value)}><option value="all">Todas las campañas</option>{campaigns.map(campaign => <option key={campaign.id} value={campaign.id}>{campaign.title} · {campaign.status}</option>)}</select></label>
      <label className="results-purpose"><span>Finalidad de exportación</span><input value={purpose} onChange={event => setPurpose(event.target.value)} maxLength={240} placeholder="Ej. Revisión de calibración" /></label>
      <button className="button primary" disabled={!canExport} onClick={() => exportResults.mutate({ ...input, purpose: purpose.trim() })}>{exportResults.isPending ? <Loader2 className="spin" size={16} /> : <Download size={16} />}{exportResults.isPending ? "Generando…" : "Exportar CSV"}</button>
    </section>
    {exportResults.error && <p className="results-export-error" role="alert">No se pudo exportar: {exportResults.error.message}</p>}
    <p className="results-audit-note"><ShieldCheck size={15} /> La descarga incluye solo los campos mínimos de seguimiento y queda registrada con actor, alcance y finalidad.</p>

    <section className="results-metrics" aria-label="Indicadores de resultados">
      <article><UsersRound size={19} /><small>Asignadas</small><strong>{summary.assigned}</strong><span>Evaluaciones registradas</span></article>
      <article><FileBarChart2 size={19} /><small>Enviadas</small><strong>{summary.submitted}</strong><span>{percentage(summary.completionRate)} de finalización</span></article>
      <article><ShieldCheck size={19} /><small>Diagnosticadas</small><strong>{summary.diagnosed}</strong><span>Con cálculo versionado</span></article>
      <article><SlidersHorizontal size={19} /><small>Promedio observado</small><strong>{summary.averageOverall ?? "—"}</strong><span>Escala 1–4</span></article>
    </section>

    <section className="results-table-panel"><header><div><p className="eyebrow">Detalle protegido</p><h2>Evaluaciones y diagnósticos</h2><p>Los estados sin diagnóstico indican que aún falta envío o cálculo explícito de People & Culture.</p></div><span>{records.length} registros</span></header>
      {records.length === 0 ? <div className="results-empty"><FileBarChart2 size={26} /><h3>Aún no hay resultados para este alcance.</h3><p>Cuando se asignen y envíen evaluaciones, sus estados y diagnósticos aparecerán aquí. No se generan datos ficticios.</p></div> : <div className="results-scroll"><table><thead><tr><th>Código</th><th>Campaña</th><th>Estado</th><th>Enviada</th><th>Puntaje</th><th>Cobertura</th><th>Diagnóstico</th></tr></thead><tbody>{records.map(record => <tr key={record.assessmentId}><td><strong>{record.reportCode}</strong><small>{record.roleTitle}{record.area ? ` · ${record.area}` : ""}</small></td><td>{record.campaignTitle}</td><td><span className={`result-state state-${record.assessmentState}`}>{record.assessmentState === "submitted" || record.assessmentState === "locked" ? "Enviada" : record.assessmentState === "in_progress" ? "En progreso" : "Asignada"}</span></td><td>{formatDateTime(record.submittedAt)}</td><td>{record.diagnosis?.overall ?? "—"}</td><td>{record.diagnosis ? percentage(record.diagnosis.coverage ?? 0) : "—"}</td><td>{record.diagnosis ? <span className="diagnosis-ready">Calculado</span> : "Pendiente"}</td></tr>)}</tbody></table></div>}
    </section>
  </div>;
}
