import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authenticateRequest: vi.fn(),
  isCampaignReminderScheduler: vi.fn(),
  runAllCampaignReminders: vi.fn(),
}));

vi.mock("../../_core/sdk", () => ({
  sdk: { authenticateRequest: mocks.authenticateRequest },
}));

vi.mock("./campaigns", () => ({
  isCampaignReminderScheduler: mocks.isCampaignReminderScheduler,
  runAllCampaignReminders: mocks.runAllCampaignReminders,
}));

import { campaignReminderHandler } from "./campaignReminderHandler";

function responseStub() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  return { status, json } as unknown as Response & { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };
}

describe("campaignReminderHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rechaza solicitudes que no sean tareas cron", async () => {
    mocks.authenticateRequest.mockResolvedValue({ isCron: false, taskUid: undefined });
    const res = responseStub();

    await campaignReminderHandler({ path: "/api/scheduled/campaign-reminders" } as Request, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "cron-only" });
    expect(mocks.runAllCampaignReminders).not.toHaveBeenCalled();
  });

  it("omite una tarea cron huérfana sin provocar reintentos", async () => {
    mocks.authenticateRequest.mockResolvedValue({ isCron: true, taskUid: "unknown-task" });
    mocks.isCampaignReminderScheduler.mockResolvedValue(false);
    const res = responseStub();

    await campaignReminderHandler({ path: "/api/scheduled/campaign-reminders" } as Request, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ok: true, skipped: "orphan" });
    expect(mocks.runAllCampaignReminders).not.toHaveBeenCalled();
  });

  it("ejecuta los avisos únicamente para el taskUid global registrado", async () => {
    mocks.authenticateRequest.mockResolvedValue({ isCron: true, taskUid: "global-campaign-task" });
    mocks.isCampaignReminderScheduler.mockResolvedValue(true);
    const result = { processedCampaigns: 2, emittedReminders: 3 };
    mocks.runAllCampaignReminders.mockResolvedValue(result);
    const res = responseStub();

    await campaignReminderHandler({ path: "/api/scheduled/campaign-reminders" } as Request, res);

    expect(mocks.isCampaignReminderScheduler).toHaveBeenCalledWith("global-campaign-task");
    expect(mocks.runAllCampaignReminders).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(result);
  });
});
