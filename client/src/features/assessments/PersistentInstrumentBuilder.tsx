import { ArrowLeft, CheckCircle2, ClipboardCheck, FilePenLine, Loader2, Plus, Save, Send, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { engineeringCompetencies, engineeringEvaluationTypes, engineeringProfiles, getEngineeringProfile, type EngineeringProfileId } from "@/features/profiling/engineeringMatrix";
import { trpc } from "@/lib/trpc";
import "./persistentInstrumentBuilder.css";

type Scope = { tenantId: string; pilotId: string };
type Question = { id: string; competencyId: string; prompt: string; required: boolean; weight: number; type: "scale" };

const defaultQuestions = (): Question[] => [
  { id: "question-1", competencyId: engineeringCompetencies[0].id, prompt: "Demuestro la competencia mediante decisiones y entregables observables.", required: true, weight: 1, type: "scale" },
  { id: "question-2", competencyId: engineeringCompetencies[1].id, prompt: "Solicito, incorporo y comunico feedback de manera responsable.", required: true, weight: 1, type: "scale" },
];

function formatDate(value: Date | string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("es-PY", { dateStyle: "medium", timeStyle: "short" });
}

export default function PersistentInstrumentBuilder({ scope, onBack }: { scope: Scope; onBack: () => void }) {
  const utils = trpc.useUtils();
  const drafts = trpc.pilot.listInstrumentDrafts.useQuery(scope);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const activeDraft = trpc.pilot.getInstrumentDraft.useQuery({ ...scope, draftId: activeDraftId ?? "unselected" }, { enabled: Boolean(activeDraftId) });
  const [title, setTitle] = useState("Autoevaluación Engineering · Piloto real");
  const [description, setDescription] = useState("Instrumento inicial para el piloto UCorp F1.");
  const [profileId, setProfileId] = useState<EngineeringProfileId>("engineer-ssr");
  const [evaluationType, setEvaluationType] = useState("engineering_self_assessment");
  const [selectedCompetencyIds, setSelectedCompetencyIds] = useState(() => engineeringCompetencies.map(competency => competency.id));
  const [questions, setQuestions] = useState<Question[]>(defaultQuestions);
  const [scale, setScale] = useState({ low: "Inicial", middle: "Autónomo", high: "Referente" });
  const [reviewNote, setReviewNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const profile = getEngineeringProfile(profileId);
  const busy = activeDraft.isLoading;

  useEffect(() => {
    const draft = activeDraft.data;
    if (!draft) return;
    try {
      const content = JSON.parse(draft.instrumentJson) as { profileId: EngineeringProfileId; competencies: Array<{ id: string }>; questions: Question[]; scale: typeof scale };
      setTitle(draft.title);
      setDescription(draft.description ?? "");
      setProfileId(content.profileId);
      setEvaluationType(draft.evaluationType);
      setSelectedCompetencyIds(content.competencies.map(item => item.id));
      setQuestions(content.questions);
      setScale(content.scale);
      setReviewNote(draft.reviewNote ?? "");
    } catch {
      setMessage("No se pudo reconstruir este borrador. Creá una nueva versión para continuar.");
    }
  }, [activeDraft.data]);

  const payload = useMemo(() => ({
    title,
    description,
    evaluationType,
    matrixVersion: "itti-engineering-2026.1",
    formulaVersion: "ucorp-f1-1.0",
    instrumentJson: JSON.stringify({
      profileId,
      competencies: engineeringCompetencies.filter(competency => selectedCompetencyIds.includes(competency.id)).map(competency => ({ id: competency.id, name: competency.name, expected: profile.expectedLevel, weight: 1 })),
      questions,
      scale,
    }),
  }), [description, evaluationType, profile.expectedLevel, profileId, questions, scale, selectedCompetencyIds, title]);

  const createDraft = trpc.pilot.createInstrumentDraft.useMutation();
  const updateDraft = trpc.pilot.updateInstrumentDraft.useMutation();
  const submitReview = trpc.pilot.submitInstrumentReview.useMutation();
  const approveDraft = trpc.pilot.approveInstrumentDraft.useMutation();
  const mutationBusy = createDraft.isPending || updateDraft.isPending || submitReview.isPending || approveDraft.isPending;
  const draftState = activeDraft.data?.state ?? "new";
  const immutable = draftState === "in_review" || draftState === "approved";

  const invalidate = async () => {
    await Promise.all([utils.pilot.listInstrumentDrafts.invalidate(scope), utils.pilot.workspace.invalidate(scope)]);
    if (activeDraftId) await utils.pilot.getInstrumentDraft.invalidate({ ...scope, draftId: activeDraftId });
  };

  const resetNew = () => {
    setActiveDraftId(null);
    setTitle("Autoevaluación Engineering · Piloto real");
    setDescription("Instrumento inicial para el piloto UCorp F1.");
    setProfileId("engineer-ssr");
    setEvaluationType("engineering_self_assessment");
    setSelectedCompetencyIds(engineeringCompetencies.map(competency => competency.id));
    setQuestions(defaultQuestions());
    setScale({ low: "Inicial", middle: "Autónomo", high: "Referente" });
    setReviewNote("");
    setMessage(null);
  };

  const persist = async () => {
    setMessage(null);
    try {
      const result = activeDraftId
        ? await updateDraft.mutateAsync({ ...scope, draftId: activeDraftId, ...payload })
        : await createDraft.mutateAsync({ ...scope, ...payload });
      if (!activeDraftId) setActiveDraftId(result.id);
      await invalidate();
      setMessage(`Borrador v${result.version} guardado. Aún puede editarse antes de enviarlo a revisión.`);
      return result.id;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible guardar el borrador.");
      return null;
    }
  };

  const requestReview = async () => {
    const draftId = activeDraftId ?? await persist();
    if (!draftId) return;
    try {
      const result = await submitReview.mutateAsync({ ...scope, draftId, reviewNote });
      await invalidate();
      setMessage(`Enviado a revisión con checksum ${result.checksum.slice(0, 12)}… La versión queda bloqueada para edición.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible enviar el instrumento a revisión.");
    }
  };

  const approve = async () => {
    if (!activeDraftId) return;
    try {
      const result = await approveDraft.mutateAsync({ ...scope, draftId: activeDraftId, reviewNote });
      await invalidate();
      setMessage(`Versión aprobada como ${result.instrumentId}. El snapshot y el checksum quedan inmutables para futuras asignaciones.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible aprobar el instrumento.");
    }
  };

  const toggleCompetency = (id: string) => {
    if (immutable) return;
    setSelectedCompetencyIds(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  };

  const addQuestion = () => setQuestions(current => [...current, { id: `question-${current.length + 1}`, competencyId: selectedCompetencyIds[0] ?? engineeringCompetencies[0].id, prompt: "Nueva evidencia observable de la competencia.", required: true, weight: 1, type: "scale" }]);

  if (drafts.isLoading) return <section className="assessment-ops-state"><Loader2 className="spin" size={22} /><div><strong>Cargando instrumentos persistentes…</strong><p>Verificando el alcance del piloto y las versiones disponibles.</p></div></section>;
  if (drafts.error) return <section className="assessment-ops-state error"><ShieldCheck size={24} /><div><strong>No fue posible cargar los instrumentos.</strong><p>{drafts.error.message}</p><button className="button secondary" onClick={onBack}>Volver al ciclo</button></div></section>;

  return <div className="view-stack persistent-instrument-builder">
    <section className="instrument-builder-hero">
      <div><button className="back-button" onClick={onBack}><ArrowLeft size={16} />Ciclo de evaluación</button><p className="eyebrow">Instrumento persistente · People & Culture</p><h1>Diseñá, revisá y aprobá una evaluación trazable.</h1><p>El borrador se guarda dentro del piloto real. La aprobación crea un snapshot inmutable que luego podrá asignarse a una campaña.</p></div>
      <div className={`instrument-state state-${draftState}`}><small>Estado de la versión</small><strong>{draftState === "new" ? "Nuevo borrador" : draftState === "draft" ? "Editable" : draftState === "in_review" ? "En revisión" : "Aprobada"}</strong><span>{activeDraft.data ? `v${activeDraft.data.version}` : "sin guardar"}</span></div>
    </section>

    <section className="instrument-builder-layout">
      <aside className="instrument-version-list"><div className="panel-header"><div><p className="eyebrow">Versiones</p><h2>Instrumentos del piloto</h2></div><FilePenLine size={19} /></div><button className="button primary full-width" onClick={resetNew} disabled={mutationBusy}><Plus size={16} />Nueva versión</button>{drafts.data?.length ? <div className="instrument-version-stack">{drafts.data.map(draft => <button key={draft.id} onClick={() => { setActiveDraftId(draft.id); setMessage(null); }} className={draft.id === activeDraftId ? "instrument-version active" : "instrument-version"}><span className={`status-dot ${draft.state}`} /><div><strong>{draft.title}</strong><small>v{draft.version} · {draft.state === "draft" ? "editable" : draft.state === "in_review" ? "en revisión" : "aprobada"}</small></div></button>)}</div> : <p className="instrument-empty">Todavía no hay instrumentos guardados para este piloto.</p>}</aside>

      <section className="instrument-editor" aria-label="Editor de instrumento persistente">
        <div className="instrument-editor-heading"><div><p className="eyebrow">Configuración</p><h2>{title || "Instrumento sin título"}</h2><p>Fuente: Matriz Engineering de People & Culture · escala normalizada 1–4.</p></div>{activeDraft.data?.checksum && <span className="checksum">SHA-256 · {activeDraft.data.checksum.slice(0, 16)}…</span>}</div>
        <div className="instrument-form-grid">
          <label className="form-label span-two">Nombre del instrumento<input value={title} onChange={event => setTitle(event.target.value)} disabled={immutable || mutationBusy} /></label>
          <label className="form-label span-two">Propósito y alcance<textarea value={description} onChange={event => setDescription(event.target.value)} disabled={immutable || mutationBusy} rows={2} /></label>
          <label className="form-label">Perfil Engineering<select value={profileId} onChange={event => setProfileId(event.target.value as EngineeringProfileId)} disabled={immutable || mutationBusy}>{engineeringProfiles.map(item => <option key={item.id} value={item.id}>{item.role} · {item.seniority}</option>)}</select></label>
          <label className="form-label">Tipo de evaluación<select value={evaluationType} onChange={event => setEvaluationType(event.target.value)} disabled={immutable || mutationBusy}>{engineeringEvaluationTypes.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        </div>
        <section className="instrument-section"><div className="section-title"><div><p className="eyebrow">Competencias</p><h3>Qué se observará</h3></div><span>{selectedCompetencyIds.length} seleccionadas</span></div><div className="persistent-competency-grid">{engineeringCompetencies.map(competency => <label key={competency.id} className={selectedCompetencyIds.includes(competency.id) ? "persistent-competency selected" : "persistent-competency"}><input type="checkbox" checked={selectedCompetencyIds.includes(competency.id)} onChange={() => toggleCompetency(competency.id)} disabled={immutable || mutationBusy} /><div><strong>{competency.name}</strong><small>Nivel esperado {profile.expectedLevel}/4</small><p>{competency.description}</p></div><CheckCircle2 size={17} /></label>)}</div></section>
        <section className="instrument-section"><div className="section-title"><div><p className="eyebrow">Evidencias</p><h3>Preguntas con escala 1–4</h3></div>{!immutable && <button className="button secondary" onClick={addQuestion} disabled={mutationBusy}><Plus size={16} />Añadir pregunta</button>}</div><div className="persistent-question-stack">{questions.map((question, index) => <article key={question.id} className="persistent-question"><span>{String(index + 1).padStart(2, "0")}</span><div><label className="form-label">Enunciado<textarea value={question.prompt} onChange={event => setQuestions(items => items.map(item => item.id === question.id ? { ...item, prompt: event.target.value } : item))} disabled={immutable || mutationBusy} rows={2} /></label><div className="instrument-form-grid compact"><label className="form-label">Competencia<select value={question.competencyId} onChange={event => setQuestions(items => items.map(item => item.id === question.id ? { ...item, competencyId: event.target.value } : item))} disabled={immutable || mutationBusy}>{engineeringCompetencies.filter(item => selectedCompetencyIds.includes(item.id)).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="form-label">Peso<input type="number" min="0.1" step="0.1" value={question.weight} onChange={event => setQuestions(items => items.map(item => item.id === question.id ? { ...item, weight: Number(event.target.value) } : item))} disabled={immutable || mutationBusy} /></label></div></div></article>)}</div></section>
        <section className="instrument-section"><div className="section-title"><div><p className="eyebrow">Escala</p><h3>Referencias visibles</h3></div><span>Valor 1–4</span></div><div className="instrument-form-grid"><label className="form-label">Nivel 1<input value={scale.low} onChange={event => setScale({ ...scale, low: event.target.value })} disabled={immutable || mutationBusy} /></label><label className="form-label">Nivel 2<input value={scale.middle} onChange={event => setScale({ ...scale, middle: event.target.value })} disabled={immutable || mutationBusy} /></label><label className="form-label">Nivel 4<input value={scale.high} onChange={event => setScale({ ...scale, high: event.target.value })} disabled={immutable || mutationBusy} /></label></div></section>
        <section className="instrument-review"><div><ClipboardCheck size={20} /><div><strong>Revisión humana obligatoria</strong><p>La aprobación conserva el instrumento, matriz, fórmula y checksum. Para modificar una versión aprobada se inicia un nuevo borrador.</p></div></div><label className="form-label">Nota de revisión<textarea value={reviewNote} onChange={event => setReviewNote(event.target.value)} disabled={draftState === "approved" || mutationBusy} rows={2} placeholder="Criterios revisados, alcance aprobado o condiciones de uso." /></label></section>
        {message && <p className="instrument-feedback" role="status">{message}</p>}
        <footer className="instrument-actions"><button className="button secondary" onClick={persist} disabled={immutable || mutationBusy}>{mutationBusy ? <Loader2 className="spin" size={16} /> : <Save size={16} />}Guardar borrador</button><div>{draftState === "draft" || draftState === "new" ? <button className="button primary" onClick={requestReview} disabled={mutationBusy}><Send size={16} />Enviar a revisión</button> : draftState === "in_review" ? <button className="button primary" onClick={approve} disabled={mutationBusy}><CheckCircle2 size={16} />Aprobar versión</button> : <span className="instrument-approved"><CheckCircle2 size={16} />Snapshot aprobado · no editable</span>}</div></footer>
        {activeDraft.data && <p className="instrument-meta">Última actualización: {formatDate(activeDraft.data.updatedAt)} · aprobación: {formatDate(activeDraft.data.approvedAt)}</p>}
      </section>
    </section>
  </div>;
}
