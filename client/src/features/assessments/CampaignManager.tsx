import "./CampaignManager.css";
import type { Employee } from "@/data/talentDemo";
import { trpc } from "@/lib/trpc";
import { BellRing, CalendarDays, Check, Loader2, Pause, Play, Search, Send, UsersRound, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type TemplateChoice = {
  id: string;
  name: string;
  audience: string;
  competencies: string[];
};

type CampaignManagerProps = {
  employees: Employee[];
  templates: TemplateChoice[];
};

const TIMEZONE = "America/Asuncion";

function toInputDate(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function createInitialWindow() {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(9, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 14);
  end.setHours(18, 0, 0, 0);
  return { start: toInputDate(start), end: toInputDate(end) };
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("es-PY", { dateStyle: "medium", timeStyle: "short", timeZone: TIMEZONE }).format(new Date(date));
}

function campaignTone(status: string) {
  if (status === "active") return "active";
  if (status === "paused") return "paused";
  if (status === "closed") return "closed";
  return "scheduled";
}

function campaignLabel(status: string) {
  return status === "active" ? "Activa" : status === "paused" ? "Pausada" : status === "closed" ? "Cerrada" : "Programada";
}

export default function CampaignManager({ employees, templates }: CampaignManagerProps) {
  const initialWindow = useMemo(createInitialWindow, []);
  const utils = trpc.useUtils();
  const campaigns = trpc.campaigns.list.useQuery(undefined, { refetchInterval: 60_000 });
  const createCampaign = trpc.campaigns.create.useMutation({
    onSuccess: async () => {
      toast.success("Campaña creada y recordatorios internos programados.");
      await utils.campaigns.list.invalidate();
      setSelectedIds([]);
      setTitle("");
    },
    onError: error => toast.error(error.message),
  });
  const setStatus = trpc.campaigns.setStatus.useMutation({
    onSuccess: async () => {
      await utils.campaigns.list.invalidate();
      toast.success("Estado de campaña actualizado.");
    },
    onError: error => toast.error(error.message),
  });
  const [title, setTitle] = useState("");
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [startAt, setStartAt] = useState(initialWindow.start);
  const [endAt, setEndAt] = useState(initialWindow.end);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedTemplate = templates.find(template => template.id === templateId) ?? templates[0];
  const filteredEmployees = useMemo(() => employees.filter(employee =>
    `${employee.name} ${employee.role} ${employee.area} ${employee.seniority}`.toLowerCase().includes(query.toLowerCase()),
  ), [employees, query]);

  function toggleParticipant(employeeId: string) {
    setSelectedIds(current => current.includes(employeeId)
      ? current.filter(id => id !== employeeId)
      : [...current, employeeId]);
  }

  function toggleFilteredParticipants() {
    const visibleIds = filteredEmployees.map(employee => employee.id);
    const everyVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));
    setSelectedIds(current => everyVisibleSelected
      ? current.filter(id => !visibleIds.includes(id))
      : Array.from(new Set([...current, ...visibleIds])));
  }

  function submitCampaign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTemplate) return;
    const participants = employees
      .filter(employee => selectedIds.includes(employee.id))
      .map(employee => ({ employeeId: employee.id, employeeName: employee.name, employeeRole: employee.role }));
    createCampaign.mutate({
      title: title.trim() || `${selectedTemplate.name} · ${new Intl.DateTimeFormat("es-PY", { month: "short", year: "numeric" }).format(new Date(startAt))}`,
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      timezone: TIMEZONE,
      participants,
    });
  }

  const allVisibleSelected = filteredEmployees.length > 0 && filteredEmployees.every(employee => selectedIds.includes(employee.id));

  return <section className="campaign-manager" aria-labelledby="campaign-manager-title">
    <div className="campaign-manager-head">
      <div>
        <p className="eyebrow">Operación de ciclos</p>
        <h2 id="campaign-manager-title">Campañas de evaluación</h2>
        <p>Define quién participa, la ventana de evaluación y los avisos que se emitirán dentro de la plataforma.</p>
      </div>
      <div className="campaign-policy"><BellRing size={18} /><span><strong>Cadencia automática</strong>Inicio · mitad de ventana · 48 h antes del cierre</span></div>
    </div>

    <div className="campaign-grid">
      <form className="campaign-create" onSubmit={submitCampaign}>
        <div className="campaign-create-heading"><span className="campaign-step">01</span><div><h3>Nueva campaña</h3><p>La configuración queda registrada antes de iniciar los avisos.</p></div></div>
        <label className="form-label">Nombre de campaña
          <input value={title} onChange={event => setTitle(event.target.value)} placeholder="Ej. Evaluación Engineering · Q4" />
        </label>
        <label className="form-label">Instrumento
          <select value={templateId} onChange={event => setTemplateId(event.target.value)}>
            {templates.map(template => <option value={template.id} key={template.id}>{template.name} · {template.audience}</option>)}
          </select>
        </label>
        {selectedTemplate && <div className="campaign-template-context"><small>Competencias incluidas</small><div>{selectedTemplate.competencies.slice(0, 4).map(competency => <span key={competency}>{competency}</span>)}</div></div>}
        <div className="campaign-date-grid">
          <label className="form-label">Inicio
            <input type="datetime-local" value={startAt} onChange={event => setStartAt(event.target.value)} required />
          </label>
          <label className="form-label">Cierre
            <input type="datetime-local" value={endAt} onChange={event => setEndAt(event.target.value)} required />
          </label>
        </div>
        <p className="campaign-timezone"><CalendarDays size={15} /> Zona horaria: Paraguay (GMT-3). La campaña debe durar al menos 24 horas.</p>

        <div className="participant-picker">
          <div className="participant-picker-head"><div><h4>Participantes</h4><p>{selectedIds.length} seleccionados</p></div><button type="button" className="text-link" onClick={toggleFilteredParticipants}>{allVisibleSelected ? "Quitar visibles" : "Seleccionar visibles"}</button></div>
          <label className="campaign-search"><Search size={15} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar por nombre, cargo o área" /></label>
          <div className="participant-list" role="group" aria-label="Participantes de la campaña">
            {filteredEmployees.slice(0, 12).map(employee => {
              const selected = selectedIds.includes(employee.id);
              return <label className={selected ? "participant-option selected" : "participant-option"} key={employee.id}>
                <input type="checkbox" checked={selected} onChange={() => toggleParticipant(employee.id)} />
                <span className={`avatar av-${employee.id.slice(-1)}`}>{employee.initials}</span>
                <span><strong>{employee.name}</strong><small>{employee.role} · {employee.seniority}</small></span>
                {selected && <Check size={15} />}
              </label>;
            })}
            {filteredEmployees.length === 0 && <p className="participant-empty">No encontramos colaboradores con ese criterio.</p>}
          </div>
        </div>
        <button className="button primary campaign-submit" type="submit" disabled={createCampaign.isPending || selectedIds.length === 0 || !selectedTemplate}>
          {createCampaign.isPending ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}
          {createCampaign.isPending ? "Programando…" : "Crear y programar campaña"}
        </button>
      </form>

      <div className="campaign-list-panel">
        <div className="campaign-list-head"><div><h3>Campañas en seguimiento</h3><p>El historial de avisos demuestra cuándo el sistema notificó a cada participante pendiente.</p></div><span className="campaign-count"><UsersRound size={16} />{campaigns.data?.length ?? 0}</span></div>
        {campaigns.isLoading && <div className="campaign-loading"><Loader2 className="animate-spin" size={18} />Cargando campañas…</div>}
        {campaigns.isError && <div className="campaign-error" role="alert">No fue posible cargar las campañas. Recargá la vista para reintentar.</div>}
        {!campaigns.isLoading && !campaigns.isError && (campaigns.data?.length ?? 0) === 0 && <div className="campaign-empty"><BellRing size={24} /><strong>Aún no hay campañas operativas.</strong><p>Crea la primera para activar el calendario y el registro de avisos internos.</p></div>}
        <div className="campaign-card-list">
          {campaigns.data?.map(campaign => {
            const progress = campaign.participantCount ? Math.round((campaign.completedCount / campaign.participantCount) * 100) : 0;
            return <article className="campaign-card" key={campaign.id}>
              <div className="campaign-card-head"><div><span className={`campaign-status ${campaignTone(campaign.status)}`}>{campaignLabel(campaign.status)}</span><h4>{campaign.title}</h4><p>{campaign.templateName}</p></div><span className="campaign-id">#{campaign.id}</span></div>
              <div className="campaign-window"><CalendarDays size={15} /><span>{formatDate(campaign.startAt)} — {formatDate(campaign.endAt)}</span></div>
              <div className="campaign-progress"><div><span>Progreso</span><strong>{campaign.completedCount}/{campaign.participantCount}</strong></div><i><b style={{ width: `${progress}%` }} /></i></div>
              <div className="campaign-reminder-summary"><BellRing size={15} /><span>{campaign.reminderCount === 0 ? "El primer aviso se registrará al inicio." : `${campaign.reminderCount} avisos internos emitidos.`}</span></div>
              {campaign.latestReminder && <p className="campaign-latest"><strong>Último aviso:</strong> {campaign.latestReminder.title} · {formatDate(campaign.latestReminder.deliveredAt)}</p>}
              <div className="campaign-card-actions">
                {campaign.status === "paused" && <button className="button mini" onClick={() => setStatus.mutate({ campaignId: campaign.id, status: "active" })}><Play size={14} />Reanudar</button>}
                {(campaign.status === "scheduled" || campaign.status === "active") && <button className="button subtle mini" onClick={() => setStatus.mutate({ campaignId: campaign.id, status: "paused" })}><Pause size={14} />Pausar</button>}
                {(campaign.status === "scheduled" || campaign.status === "active" || campaign.status === "paused") && <button className="button subtle mini danger-action" onClick={() => setStatus.mutate({ campaignId: campaign.id, status: "closed" })}><X size={14} />Cerrar</button>}
              </div>
            </article>;
          })}
        </div>
      </div>
    </div>
  </section>;
}
