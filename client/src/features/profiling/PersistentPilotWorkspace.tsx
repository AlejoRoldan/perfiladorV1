import { Database, Loader2, Plus, ShieldCheck, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { AccessRole } from "@shared/accessControl";
import { trpc } from "@/lib/trpc";

type Scope = { tenantId: string; pilotId: string };

function toDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

function formatRetention(value: Date | string | null) {
  if (!value) return "Sin fecha de retención definida";
  return new Intl.DateTimeFormat("es-PY", { dateStyle: "medium" }).format(new Date(value));
}

export default function PersistentPilotWorkspace({ accessRole }: { accessRole: AccessRole }) {
  const utils = trpc.useUtils();
  const pilots = trpc.pilot.listAccessible.useQuery();
  const [scope, setScope] = useState<Scope | null>(null);
  const [tenantCode, setTenantCode] = useState("grupo-vazquez");
  const [tenantName, setTenantName] = useState("Grupo Vázquez");
  const [pilotCode, setPilotCode] = useState("ucorp-f1-2026");
  const [pilotName, setPilotName] = useState("Perfilador UCorp F1 — Piloto real");
  const [retentionUntil, setRetentionUntil] = useState(toDateInput(new Date(new Date().setFullYear(new Date().getFullYear() + 1))));
  const [showParticipantForm, setShowParticipantForm] = useState(false);
  const [employeeExternalId, setEmployeeExternalId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [area, setArea] = useState("");
  const [linkedUserId, setLinkedUserId] = useState("");
  const canBootstrap = accessRole === "admin";
  const canManageParticipants = accessRole === "admin" || accessRole === "people_ops";

  useEffect(() => {
    if (!scope && pilots.data?.[0]) setScope({ tenantId: pilots.data[0].tenantId, pilotId: pilots.data[0].pilotId });
  }, [pilots.data, scope]);

  const workspace = trpc.pilot.workspace.useQuery(scope ?? { tenantId: "unselected", pilotId: "unselected" }, { enabled: Boolean(scope) });
  const eligibleUsers = trpc.pilot.listEligibleUsers.useQuery({ tenantId: scope?.tenantId ?? "unselected" }, { enabled: Boolean(scope) && canManageParticipants });
  const bootstrap = trpc.pilot.bootstrap.useMutation({
    onSuccess: async result => {
      await utils.pilot.listAccessible.invalidate();
      setScope(result);
      toast.success("Tenant y piloto real creados. El espacio no contiene datos sintéticos.");
    },
    onError: error => toast.error(error.message),
  });
  const addParticipant = trpc.pilot.addParticipant.useMutation({
    onSuccess: async () => {
      await utils.pilot.workspace.invalidate();
      setEmployeeExternalId(""); setDisplayName(""); setRoleTitle(""); setArea(""); setLinkedUserId(""); setShowParticipantForm(false);
      toast.success("Participante registrado dentro del alcance del piloto.");
    },
    onError: error => toast.error(error.message),
  });

  if (pilots.isLoading) return <div className="pilot-loading-state"><Loader2 className="spin" size={22} />Cargando el espacio seguro del piloto…</div>;
  if (pilots.error) return <section className="pilot-workspace-empty"><ShieldCheck size={28} /><h1>No fue posible verificar tus permisos.</h1><p>{pilots.error.message}</p></section>;

  if (!pilots.data?.length) {
    return <section className="pilot-workspace-empty" aria-live="polite">
      <Database size={30} />
      <p className="eyebrow">Perfilador persistente</p>
      <h1>No hay un piloto real autorizado para tu identidad.</h1>
      <p>Los datos de demostración fueron retirados de esta ruta. Para proteger el piloto, solo se muestran workspaces creados en el tenant asignado a tu sesión.</p>
      {canBootstrap ? <form className="pilot-bootstrap-form" onSubmit={event => {
        event.preventDefault();
        bootstrap.mutate({ tenantCode, tenantName, pilotCode, pilotName, retentionUntil: new Date(`${retentionUntil}T00:00:00`) });
      }}>
        <h2>Aprovisionar un piloto real</h2>
        <p>Esta acción crea un tenant, te asigna como miembro y deja el piloto en estado de borrador. No crea participantes ni respuestas.</p>
        <div className="pilot-form-grid">
          <label>Código de tenant<input required pattern="[a-z0-9-]+" value={tenantCode} onChange={event => setTenantCode(event.target.value.toLowerCase())} /></label>
          <label>Nombre de tenant<input required value={tenantName} onChange={event => setTenantName(event.target.value)} /></label>
          <label>Código de piloto<input required pattern="[a-z0-9-]+" value={pilotCode} onChange={event => setPilotCode(event.target.value.toLowerCase())} /></label>
          <label>Nombre del piloto<input required value={pilotName} onChange={event => setPilotName(event.target.value)} /></label>
          <label>Retención hasta<input required type="date" value={retentionUntil} onChange={event => setRetentionUntil(event.target.value)} /></label>
        </div>
        <button className="button primary" type="submit" disabled={bootstrap.isPending}>{bootstrap.isPending ? <><Loader2 className="spin" size={16} />Creando…</> : <><Plus size={16} />Crear espacio aislado</>}</button>
      </form> : <p className="pilot-empty-note">Solicitá a Administración la asignación a un tenant o la creación del piloto. People & Culture no puede aprovisionar un tenant por sí mismo.</p>}
    </section>;
  }

  const current = workspace.data;
  return <div className="view-stack persistent-pilot-workspace">
    <div className="pilot-workspace-header">
      <div><p className="eyebrow">Perfilador UCorp F1 · repositorio persistente</p><h1>{current?.pilot.name ?? "Cargando piloto…"}</h1><p>Tenant aislado: <strong>{current?.pilot.tenantId ?? scope?.tenantId}</strong> · Clasificación: <strong>datos reales</strong> · Retención: {current ? formatRetention(current.pilot.retentionUntil) : "…"}</p></div>
      <label className="pilot-selector">Piloto autorizado<select value={scope?.pilotId ?? ""} onChange={event => {
        const selected = pilots.data.find(item => item.pilotId === event.target.value);
        if (selected) setScope({ tenantId: selected.tenantId, pilotId: selected.pilotId });
      }}>{pilots.data.map(item => <option key={item.pilotId} value={item.pilotId}>{item.tenantName} · {item.pilotName}</option>)}</select></label>
    </div>

    {workspace.isLoading ? <div className="pilot-loading-state"><Loader2 className="spin" size={22} />Verificando alcance de campaña y participantes…</div> : workspace.error ? <section className="pilot-workspace-empty"><ShieldCheck size={28} /><h2>Este piloto no está disponible.</h2><p>{workspace.error.message}</p></section> : current ? <>
      <div className="persistent-pilot-stats">
        <article><small>Campañas aisladas</small><strong>{current.campaigns.length}</strong><span>Filtradas por tenant y piloto</span></article>
        <article><small>Instrumentos aprobados</small><strong>{current.instruments.length}</strong><span>Versión y checksum preservados</span></article>
        <article><small>Participantes visibles</small><strong>{current.participants.length}</strong><span>{canManageParticipants ? "Códigos operativos, sin respuestas" : "Solo tu propia asignación"}</span></article>
      </div>
      <article className="data-panel persistent-pilot-panel"><div className="panel-header"><div><p className="eyebrow">Participantes</p><h2>Directorio del piloto</h2><p>Las respuestas y diagnósticos no se exponen en este listado.</p></div>{canManageParticipants && <button className="button primary" onClick={() => setShowParticipantForm(value => !value)}><Plus size={16} />{showParticipantForm ? "Cancelar" : "Agregar participante"}</button>}</div>
        {showParticipantForm && scope && <form className="pilot-participant-form" onSubmit={event => {
          event.preventDefault();
          addParticipant.mutate({ tenantId: scope.tenantId, pilotId: scope.pilotId, employeeExternalId, displayName, roleTitle, area: area || undefined, linkedUserId: linkedUserId ? Number(linkedUserId) : undefined });
        }}>
          <label>Identificador de colaborador<input required value={employeeExternalId} onChange={event => setEmployeeExternalId(event.target.value)} placeholder="ID de HRIS o legajo" /></label>
          <label>Nombre visible<input required value={displayName} onChange={event => setDisplayName(event.target.value)} /></label>
          <label>Rol<input required value={roleTitle} onChange={event => setRoleTitle(event.target.value)} /></label>
          <label>Área<input value={area} onChange={event => setArea(event.target.value)} /></label>
          <label>Cuenta OAuth activa<select value={linkedUserId} onChange={event => setLinkedUserId(event.target.value)}><option value="">Invitar después (sin evaluación aún)</option>{eligibleUsers.data?.map(user => <option value={user.id} key={user.id}>{user.name ?? user.email ?? `Cuenta ${user.id}`} · {user.role}</option>)}</select><small>Una cuenta vinculada queda activa y puede ver únicamente sus propias evaluaciones.</small></label>
          <button className="button primary" type="submit" disabled={addParticipant.isPending}>{addParticipant.isPending ? "Guardando…" : "Guardar participante"}</button>
        </form>}
        {!current.participants.length ? <div className="pilot-no-participants"><UsersRound size={22} /><p>Aún no hay participantes reales en este piloto. La primera carga debe realizarse con el consentimiento y los campos mínimos definidos para el piloto.</p></div> : <div className="pilot-participant-list">{current.participants.map(participant => <div key={participant.id}><span className="report-code">{participant.reportCode}</span><span><strong>{participant.roleTitle}</strong><small>{[participant.area, participant.seniority].filter(Boolean).join(" · ") || "Sin atributos organizacionales adicionales"}</small></span><span className={`participant-state ${participant.status}`}>{participant.status === "active" ? "Activo" : participant.status === "revoked" ? "Revocado" : "Invitado"}</span></div>)}</div>}
      </article>
      <article className="data-panel persistent-pilot-panel pilot-security-note"><ShieldCheck size={23} /><div><h2>Protección antes de evaluación</h2><p>Las futuras sesiones, respuestas y diagnósticos se consultan por las claves <code>tenantId</code>, <code>pilotId</code> y <code>participantId</code>. El servidor rechaza cruces de alcance y cada operación crea un evento de auditoría sin copiar respuestas al log.</p></div></article>
    </> : null}
  </div>;
}
