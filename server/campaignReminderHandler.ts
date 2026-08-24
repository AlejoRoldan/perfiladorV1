import type { Request, Response } from "express";
import { isCampaignReminderScheduler, runAllCampaignReminders } from "./campaigns";
import { sdk } from "./_core/sdk";

/** HTTP entry point for the platform-managed hourly reminder task. */
export async function campaignReminderHandler(req: Request, res: Response) {
  let taskUid: string | undefined;
  try {
    const user = await sdk.authenticateRequest(req);
    taskUid = user.taskUid;
    if (!user.isCron || !taskUid) {
      return res.status(403).json({ error: "cron-only" });
    }
    if (!await isCampaignReminderScheduler(taskUid)) {
      return res.status(200).json({ ok: true, skipped: "orphan" });
    }
    const result = await runAllCampaignReminders();
    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido al emitir avisos internos.";
    console.error("[Campaign reminders]", message, { taskUid });
    return res.status(500).json({
      error: message,
      context: { taskUid: taskUid ?? null, path: req.path },
      timestamp: new Date().toISOString(),
    });
  }
}
