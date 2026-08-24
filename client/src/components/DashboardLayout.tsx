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
import { LogOut } from "lucide-react";
import { roleLabels, type AccessRole } from "@shared/accessControl";
import { useState } from "react";

export type AppView = "overview" | "people" | "profile" | "assessments" | "builder" | "flow" | "pilot" | "mobility" | "reports" | "settings";
export type AuthenticatedUser = { name: string | null; email: string | null; role: AccessRole };

const items: Array<{ id: AppView; label: string; icon: typeof BarChart3; group?: string }> = [
  { id: "overview", label: "Panorama", icon: BarChart3, group: "Inteligencia" },
  { id: "people", label: "Colaboradores", icon: UsersRound },
  { id: "assessments", label: "Ciclo de evaluación", icon: ClipboardCheck, group: "Gestión" },
  { id: "pilot", label: "Datos del piloto", icon: ClipboardCheck, group: "Piloto" },
  { id: "mobility", label: "Movilidad · futuro", icon: BriefcaseBusiness },
  { id: "reports", label: "Reportes", icon: ArrowUpRight, group: "Gobierno" },
  { id: "settings", label: "Configuración", icon: Settings2 },
];

export default function DashboardLayout({
  activeView,
  onNavigate,
  user,
  onLogout,
  children,
}: {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  user: AuthenticatedUser;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const canOpen = (view: AppView) => ({
    admin: true,
    people_ops: view !== "settings",
    manager: ["overview", "profile", "flow", "pilot"].includes(view),
    collaborator: ["profile", "flow", "pilot"].includes(view),
  })[user.role];

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
        <div className="sidebar-note"><ShieldCheck size={16} /><span>Espacio aislado del piloto<br />Datos demo separados</span></div>
      </aside>
      {open && <button className="sidebar-scrim" aria-label="Cerrar menú" onClick={() => setOpen(false)} />}
      <section className="app-stage">
        <header className="app-header">
          <button className="menu-trigger" onClick={() => setOpen(true)} aria-label="Abrir navegación"><Menu size={21} /></button>
          <div className="crumb"><span>People & Culture</span><b>/</b><strong>{items.find(item => item.id === activeView)?.label ?? (activeView === "profile" ? "Perfil 360°" : activeView === "builder" ? "Constructor" : "Experiencia de evaluación")}</strong></div>
          <div className="header-actions">
            <span className="sync-state"><span className="signal-dot" />Actualizado ahora</span>
            <div className="role-wrap"><div className="role-button" aria-label={`Sesión de ${roleLabels[user.role]}`}><span className="role-avatar">{(user.name ?? "U").slice(0, 2).toUpperCase()}</span><span><small>{roleLabels[user.role]}</small>{user.name ?? user.email ?? "Usuario autenticado"}</span></div><button className="icon-button" type="button" onClick={onLogout} aria-label="Cerrar sesión"><LogOut size={16} /></button></div>
          </div>
        </header>
        <main className="app-content">{children}</main>
      </section>
    </div>
  );
}
