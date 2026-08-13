import {
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  ChevronDown,
  ClipboardCheck,
  Menu,
  Settings2,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { useState } from "react";

export type AppView = "overview" | "people" | "profile" | "assessments" | "builder" | "flow" | "pilot" | "mobility" | "reports" | "settings";
export type DemoRole = "Administrador People & Culture" | "Líder de equipo" | "Colaborador";

const items: Array<{ id: AppView; label: string; icon: typeof BarChart3; group?: string }> = [
  { id: "overview", label: "Panorama", icon: BarChart3, group: "Inteligencia" },
  { id: "people", label: "Colaboradores", icon: UsersRound },
  { id: "assessments", label: "Evaluaciones", icon: ClipboardCheck, group: "Gestión" },
  { id: "pilot", label: "Perfilador F1", icon: ClipboardCheck, group: "Piloto" },
  { id: "mobility", label: "Movilidad · futuro", icon: BriefcaseBusiness },
  { id: "reports", label: "Reportes", icon: ArrowUpRight, group: "Gobierno" },
  { id: "settings", label: "Configuración", icon: Settings2 },
];

export default function DashboardLayout({
  activeView,
  onNavigate,
  role,
  onRoleChange,
  children,
}: {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  role: DemoRole;
  onRoleChange: (role: DemoRole) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const canOpen = (view: AppView) => role === "Administrador People & Culture" || (role === "Líder de equipo" && !["settings", "reports"].includes(view)) || (role === "Colaborador" && ["overview", "profile", "flow"].includes(view));

  return (
    <div className="app-shell">
      <aside className={`app-sidebar ${open ? "is-open" : ""}`} aria-label="Navegación principal">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">i</span>
          <div><strong>itti</strong><span>talent compass</span></div>
          <button className="mobile-close" onClick={() => setOpen(false)} aria-label="Cerrar navegación">×</button>
        </div>
        <div className="tenant-switcher">
          <span className="signal-dot" />
          <div><small>Tenant activo</small><strong>Grupo Vázquez</strong></div>
          <ChevronDown size={16} />
        </div>
        <nav className="side-nav">
          {items.map((item, index) => (
            <div key={item.id}>
              {(index === 0 || item.group) && <p className="nav-group">{item.group}</p>}
              <button disabled={!canOpen(item.id)} title={!canOpen(item.id) ? "Esta vista requiere un rol con permiso de gestión." : undefined} className={`${(activeView === item.id || (item.id === "people" && activeView === "profile") || (item.id === "assessments" && ["builder", "flow"].includes(activeView))) ? "nav-item active" : "nav-item"} ${!canOpen(item.id) ? "locked" : ""}`} onClick={() => { if (canOpen(item.id)) { onNavigate(item.id); setOpen(false); } }}>
                <item.icon size={18} strokeWidth={1.8} /> <span>{item.label}</span>
                {!canOpen(item.id) && <small>Restringido</small>}
              </button>
            </div>
          ))}
        </nav>
        <div className="sidebar-note"><ShieldCheck size={16} /><span>Datos demo sintéticos<br />Tema ITTI configurable</span></div>
      </aside>
      {open && <button className="sidebar-scrim" aria-label="Cerrar menú" onClick={() => setOpen(false)} />}
      <section className="app-stage">
        <header className="app-header">
          <button className="menu-trigger" onClick={() => setOpen(true)} aria-label="Abrir navegación"><Menu size={21} /></button>
          <div className="crumb"><span>People & Culture</span><b>/</b><strong>{items.find(item => item.id === activeView)?.label ?? (activeView === "profile" ? "Perfil 360°" : activeView === "builder" ? "Constructor" : "Experiencia de evaluación")}</strong></div>
          <div className="header-actions">
            <span className="sync-state"><span className="signal-dot" />Actualizado ahora</span>
            <div className="role-wrap">
              <button className="role-button" onClick={() => setRoleOpen(!roleOpen)} aria-expanded={roleOpen}><span className="role-avatar">MR</span><span><small>Acceso demo</small>{role}</span><ChevronDown size={15} /></button>
              {roleOpen && <div className="role-menu"><p>Vista simulada</p>{(["Administrador People & Culture", "Líder de equipo", "Colaborador"] as DemoRole[]).map(option => <button key={option} onClick={() => { onRoleChange(option); setRoleOpen(false); }}>{option}</button>)}</div>}
            </div>
          </div>
        </header>
        <main className="app-content">{children}</main>
      </section>
    </div>
  );
}
