import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, ClipboardCheck, Loader2, Send, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { toast } from "sonner";
import type { AccessRole } from "@shared/accessControl";
import { trpc } from "@/lib/trpc";
import "./persistentEvaluationCycle.css";

type Scope = { tenantId: string; pilotId: string };

type InstrumentContent = {
  profileId: string;
  competencies: Array<{ id: string; name: string; expected: number; weight: number }>;
  questions: Array<{ id: string; competencyId: string; prompt: string; required: boolean; weight: number; type: "scale" }>;
};

function toLocalDateTime(value: Date) {
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function formatState(state: string) {
  return state === "assigned" ? "Pendiente" : state === "in_progress" ? "En progreso" : state === "submitted" ? "Enviada" : "Bloqueada";
}

function ParticipantInbox({ scope }: { scope: Scope }) {
  const utils = trpc.useUtils();
  const tasks = trpc.pilot.myAssessments.useQuery(scope);
  const [answers, setAnswers] = useState<Record<string, Record<string, number>>>({});
  const saveAnswers = trpc.pilot.saveOwnAnswers.useMutation({ onSuccess: () => { utils.pilot.myAssessments.invalidate(scope); toast.success("Borrador guardado en el repositorio seguro."); }, onError: error => toast.error(error.message) });
  const submit = trpc.pilot.submitOwnAssessment.useMutation({ onSuccess: () => { utils.pilot.myAssessments.invalidate(scope); toast.success("Evaluación enviada y bloqueada para edición."); }, onError: error => toast.error(error.message) });

  useEffect(() => {
    if (!tasks.data) return;
    setAnswers(current => Object.fromEntries(tasks.data.map(task => [task.id, current[task.id] ?? Object.fromEntries(task.answers.filter(answer => answer.scoredValue !== null).map(answer => [answer.questionId, answer.scoredValue as number]))])));
  }, [tasks.data]);

  if (tasks.isLoading) return <section className="evaluation-cycle-state"><Loader2 className="spin" size={20} />Cargando tus evaluaciones autorizadas…</section>;
  if (tasks.error) return <section className="evaluation-cycle-state error"><ShieldCheck size={22} /><p>{tasks.error.message}</p></section>;
  if (!tasks.data?.length) return <section className="evaluation-cycle-empty"><ClipboardCheck size={28} /><h2>No tenés evaluaciones asignadas.</h2><p>Cuando People & Culture vincule una evaluación a tu identidad activa, aparecerá aquí sin exponer datos de otras personas.</p></section>;

  return <section className="evaluation-inbox"><div className="evaluation-section-heading"><div><p className="eyebrow">Mi espacio de evaluación</p><h2>Respuestas guardadas en MySQL/TiDB</h2><p>Elegí un nivel de 1 a 4. El servidor valida que la evaluación te pertenezca antes de guardar o enviar.</p></div><ShieldCheck size={22} /></div>{tasks.data.map(task => {
    const content = JSON.parse(task.instrumentJson) as InstrumentContent;
    const valueByQuestion = answers[task.id] ?? {};
    const answered = Object.keys(valueByQuestion).length;
    const canEdit = task.state === "assigned" || task.state === "in_progress";
    const persist = (finalize = false) => {
      const values = Object.entries(valueByQuestion).map(([questionId, scoredValue]) => ({ questionId, flow: "competencies" as const, responseJson: JSON.stringify({ scoredValue }), scoredValue }));
      if (!values.length) return toast.error("Respondé al menos una evidencia antes de guardar.");
      saveAnswers.mutate({ ...scope, assessmentId: task.id, participantId: task.participantId, answers: values }, { onSuccess: () => { if (finalize) submit.mutate({ ...scope, assessmentId: task.id, participantId: task.participantId }); } });
    };
    return <article className="evaluation-task" key={task.id}><header><div><span className={`evaluation-status ${task.state}`}>{formatState(task.state)}</span><h3>{task.title}</h3><p>Fecha límite: {new Intl.DateTimeFormat("es-PY", { dateStyle: "medium", timeStyle: "short" }).format(new Date(task.endAt))} · {answered}/{content.questions.length} evidencias preparadas</p></div><span className="evaluation-scale">Escala 1–4</span></header><div className="evaluation-question-list">{content.questions.map((question, index) => <fieldset disabled={!canEdit} key={question.id}><legend><strong>{index + 1}. {question.prompt}</strong><span>Competencia: {content.competencies.find(competency => competency.id === question.competencyId)?.name ?? "Referencia"}</span></legend><div className="evaluation-score-options">{[1, 2, 3, 4].map(value => <label key={value}><input type="radio" name={`${task.id}-${question.id}`} checked={valueByQuestion[question.id] === value} onChange={() => setAnswers(current => ({ ...current, [task.id]: { ...current[task.id], [question.id]: value } }))} /><span>{value}</span></label>)}</div></fieldset>)}</div>{canEdit ? <footer><button className="button secondary" onClick={() => persist()} disabled={saveAnswers.isPending}><CheckCircle2 size={16} />Guardar borrador</button><button className="button primary" onClick={() => persist(true)} disabled={saveAnswers.isPending || submit.isPending || answered !== content.questions.length}><Send size={16} />Enviar evaluación</button></footer> : <footer className="evaluation-locked"><CheckCircle2 size={16} />Esta evaluación fue enviada; las respuestas ya no pueden modificarse.</footer>}</article>;
  })}</section>;
}

export default function PersistentEvaluationCycle({ accessRole, scope, onBack }: { accessRole: AccessRole; scope: Scope; onBack: () => void }) {
  const utils = trpc.useUtils();
  const workspace = trpc.pilot.workspace.useQuery(scope);
  const canManage = accessRole === "admin" || accessRole === "people_ops";
  const [instrumentId, setInstrumentId] = useState("");
  const [title, setTitle] = useState("Evaluación de desempeño · UCorp F1");
  const [startAt, setStartAt] = useState(() => toLocalDateTime(new Date()));
  const [endAt, setEndAt] = useState(() => toLocalDateTime(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)));
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const createCampaign = trpc.pilot.createCampaignFromInstrument.useMutation({ onSuccess: async campaign => { await utils.pilot.workspace.invalidate(scope); setSelectedCampaignId(campaign.id); toast.success("Campaña persistente creada y vinculada al instrumento aprobado."); }, onError: error => toast.error(error.message) });
  const assign = trpc.pilot.assignCampaignParticipants.useMutation({ onSuccess: async result => { await utils.pilot.workspace.invalidate(scope); if (selectedCampaignId) await utils.pilot.listCampaignAssignments.invalidate({ ...scope, campaignId: selectedCampaignId }); toast.success(`${result.assigned} evaluaciones fueron asignadas en el repositorio seguro.`); }, onError: error => toast.error(error.message) });
  const assignments = trpc.pilot.listCampaignAssignments.useQuery({ ...scope, campaignId: selectedCampaignId ?? 0 }, { enabled: Boolean(selectedCampaignId) && canManage });
  const diagnose = trpc.pilot.calculateDiagnosis.useMutation({ onSuccess: () => toast.success("Diagnóstico determinístico registrado y auditado."), onError: error => toast.error(error.message) });
  const availableInstruments = useMemo(() => workspace.data?.instruments.filter(instrument => !instrument.campaignId) ?? [], [workspace.data]);
  const campaigns = workspace.data?.campaigns ?? [];

  useEffect(() => { if (!instrumentId && availableInstruments[0]) setInstrumentId(availableInstruments[0].id); }, [instrumentId, availableInstruments]);
  useEffect(() => { if (!selectedCampaignId && campaigns[0]) setSelectedCampaignId(campaigns[0].id); }, [selectedCampaignId, campaigns]);

  if (workspace.isLoading) return <section className="evaluation-cycle-state"><Loader2 className="spin" size={20} />Cargando alcance persistente…</section>;
  if (workspace.error || !workspace.data) return <section className="evaluation-cycle-state error"><ShieldCheck size={22} /><p>{workspace.error?.message ?? "No fue posible cargar el piloto."}</p></section>;
  if (!canManage) return <div className="persistent-evaluation-cycle"><button className="back-link" onClick={onBack}><ArrowLeft size={16} />Volver al ciclo</button><ParticipantInbox scope={scope} /></div>;

  return <div className="persistent-evaluation-cycle"><button className="back-link" onClick={onBack}><ArrowLeft size={16} />Volver al ciclo</button><section className="evaluation-cycle-hero"><div><p className="eyebrow">Operación persistente · {workspace.data.pilot.name}</p><h1>Asignar, responder y registrar.</h1><p>Este es el tramo que conecta un instrumento aprobado con registros de evaluación y diagnóstico en MySQL/TiDB. Cada acción conserva el alcance de tenant y piloto.</p></div><ShieldCheck size={28} /></section><section className="evaluation-launch-panel"><div className="evaluation-section-heading"><div><p className="eyebrow">1 · Lanzar campaña</p><h2>Vincular una versión aprobada</h2><p>Un instrumento aprobado se vincula una sola vez para preservar reproducibilidad.</p></div><Sparkles size={20} /></div>{availableInstruments.length ? <form onSubmit={event => { event.preventDefault(); createCampaign.mutate({ ...scope, title, instrumentId, startAt: new Date(startAt), endAt: new Date(endAt), timezone: "America/Asuncion" }); }} className="evaluation-launch-form"><label>Instrumento aprobado<select value={instrumentId} onChange={event => setInstrumentId(event.target.value)}>{availableInstruments.map(instrument => <option key={instrument.id} value={instrument.id}>{instrument.id.slice(-10)} · matriz {instrument.matrixVersion}</option>)}</select></label><label>Nombre de campaña<input required value={title} onChange={event => setTitle(event.target.value)} /></label><label>Inicio<input required type="datetime-local" value={startAt} onChange={event => setStartAt(event.target.value)} /></label><label>Cierre<input required type="datetime-local" value={endAt} onChange={event => setEndAt(event.target.value)} /></label><button className="button primary" disabled={createCampaign.isPending}>{createCampaign.isPending ? <Loader2 className="spin" size={16} /> : <ClipboardCheck size={16} />}Crear campaña real</button></form> : <div className="evaluation-cycle-empty"><ClipboardCheck size={24} /><p>No hay instrumentos aprobados sin campaña. Creá y aprobá una versión antes de lanzar.</p></div>}</section><section className="evaluation-assignment-panel"><div className="evaluation-section-heading"><div><p className="eyebrow">2 · Asignar población</p><h2>Crear evaluaciones individuales</h2><p>La asignación se crea solo para participantes del piloto; no utiliza colaboradores demo.</p></div><UsersRound size={20} /></div>{campaigns.length ? <><label className="evaluation-campaign-select">Campaña<select value={selectedCampaignId ?? ""} onChange={event => setSelectedCampaignId(Number(event.target.value))}>{campaigns.map(campaign => <option key={campaign.id} value={campaign.id}>{campaign.title} · {campaign.status}</option>)}</select></label><div className="evaluation-assignment-action"><p><strong>{workspace.data.participants.length}</strong> participantes reales en este piloto. Se crearán únicamente asignaciones que todavía no existan.</p><button className="button primary" disabled={!selectedCampaignId || assign.isPending} onClick={() => selectedCampaignId && assign.mutate({ ...scope, campaignId: selectedCampaignId })}>{assign.isPending ? <Loader2 className="spin" size={16} /> : <UsersRound size={16} />}Asignar evaluaciones</button></div>{assignments.data?.length ? <div className="evaluation-assignment-list">{assignments.data.map(item => <div key={item.id}><span>{item.reportCode}</span><strong>{item.roleTitle}</strong><em>{formatState(item.state)}</em>{item.state === "submitted" && <button className="button tertiary" onClick={() => diagnose.mutate({ ...scope, assessmentId: item.id })}>Calcular diagnóstico</button>}</div>)}</div> : <p className="evaluation-no-assignments">Aún no hay evaluaciones asignadas para esta campaña.</p>}</> : <div className="evaluation-cycle-empty"><ClipboardCheck size={24} /><p>Creá una campaña vinculada a un instrumento aprobado para comenzar las asignaciones.</p></div>}</section></div>;
}
