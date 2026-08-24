import { describe, expect, it } from "vitest";
import { canManageAccess, canManageTalent, isAccessRole, roleLabels } from "../shared/accessControl";

describe("control de acceso", () => {
  it("reconoce únicamente los cuatro roles operativos", () => {
    expect(isAccessRole("admin")).toBe(true);
    expect(isAccessRole("people_ops")).toBe(true);
    expect(isAccessRole("user")).toBe(false);
  });

  it("limita la administración de talento a People & Culture y administración", () => {
    expect(canManageTalent("admin")).toBe(true);
    expect(canManageTalent("people_ops")).toBe(true);
    expect(canManageTalent("manager")).toBe(false);
    expect(canManageTalent("collaborator")).toBe(false);
  });

  it("reserva la administración de accesos para la administración de plataforma", () => {
    expect(canManageAccess("admin")).toBe(true);
    expect(canManageAccess("people_ops")).toBe(false);
    expect(roleLabels.collaborator).toBe("Colaborador");
  });
});
