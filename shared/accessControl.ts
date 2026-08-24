export const accessRoles = ["collaborator", "manager", "people_ops", "admin"] as const;
export type AccessRole = (typeof accessRoles)[number];

export const accessStatuses = ["invited", "active", "suspended"] as const;
export type AccessStatus = (typeof accessStatuses)[number];

export const roleLabels: Record<AccessRole, string> = {
  collaborator: "Colaborador",
  manager: "Líder de equipo",
  people_ops: "People & Culture",
  admin: "Administración de plataforma",
};

export function isAccessRole(value: string): value is AccessRole {
  return accessRoles.some(role => role === value);
}

export function canManageTalent(role: AccessRole) {
  return role === "admin" || role === "people_ops";
}

export function canManageAccess(role: AccessRole) {
  return role === "admin";
}
