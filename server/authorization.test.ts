import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function contextFor(role: "collaborator" | "manager" | "people_ops" | "admin", accessStatus: "invited" | "active" | "suspended" = "active"): TrpcContext {
  return {
    user: { id: 7, openId: `test-${role}`, name: "Usuario de prueba", email: "test@itti.com.py", loginMethod: "manus", role, accessStatus, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("autorización del servidor", () => {
  it("bloquea campañas para un colaborador autenticado", async () => {
    await expect(appRouter.createCaller(contextFor("collaborator")).campaigns.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("bloquea campañas para una identidad pendiente de activación", async () => {
    await expect(appRouter.createCaller(contextFor("people_ops", "invited")).campaigns.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("bloquea la exportación para un rol sin administración de plataforma", async () => {
    await expect(appRouter.createCaller(contextFor("people_ops")).reports.exportSummary()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("entrega solamente el resumen sintético a un administrador activo", async () => {
    const result = await appRouter.createCaller(contextFor("admin")).reports.exportSummary();
    expect(result.content).toContain("clasificacion");
    expect(result.content).toContain("sintetico");
    expect(result.filename).toMatch(/^itti-talent-resumen-demo-/);
  });

  it("impide que un administrador se retire a sí mismo el acceso activo", async () => {
    const caller = appRouter.createCaller(contextFor("admin"));
    await expect(caller.access.updateUser({ openId: "test-admin", role: "collaborator", accessStatus: "suspended" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
