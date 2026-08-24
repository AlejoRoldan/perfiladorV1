export const CAMPAIGN_REMINDER_TYPES = ["opening", "midpoint", "closing_48h"] as const;

export type CampaignReminderType = (typeof CAMPAIGN_REMINDER_TYPES)[number];
export type CampaignStatus = "scheduled" | "active" | "paused" | "closed";

export type CampaignWindow = {
  startAt: Date;
  endAt: Date;
  status: CampaignStatus;
};

export function assertCampaignWindow(startAt: Date, endAt: Date): void {
  if (!Number.isFinite(startAt.getTime()) || !Number.isFinite(endAt.getTime())) {
    throw new Error("Las fechas de campaña no son válidas.");
  }
  if (endAt.getTime() <= startAt.getTime()) {
    throw new Error("La fecha de cierre debe ser posterior al inicio.");
  }
  if (endAt.getTime() - startAt.getTime() < 24 * 60 * 60 * 1000) {
    throw new Error("La campaña debe tener una duración mínima de 24 horas.");
  }
}

export function getCampaignStatusAt(window: CampaignWindow, now: Date): CampaignStatus {
  if (window.status === "paused") return "paused";
  if (now.getTime() >= window.endAt.getTime()) return "closed";
  if (now.getTime() >= window.startAt.getTime()) return "active";
  return "scheduled";
}

export function getReminderDates(window: Pick<CampaignWindow, "startAt" | "endAt">): Record<CampaignReminderType, Date> {
  const start = window.startAt.getTime();
  const end = window.endAt.getTime();
  return {
    opening: new Date(start),
    midpoint: new Date(start + Math.floor((end - start) / 2)),
    closing_48h: new Date(Math.max(start, end - 48 * 60 * 60 * 1000)),
  };
}

/**
 * Returns reminders that should exist by `now`. The database idempotency key
 * guarantees that retries or an hourly scheduler do not duplicate the notice.
 */
export function getDueReminderTypes(window: CampaignWindow, now: Date): CampaignReminderType[] {
  const status = getCampaignStatusAt(window, now);
  if (status === "scheduled" || status === "paused" || status === "closed") return [];

  const dates = getReminderDates(window);
  const due = CAMPAIGN_REMINDER_TYPES.filter(type => dates[type].getTime() <= now.getTime());
  return due.filter(type => type !== "closing_48h" || dates.closing_48h.getTime() > window.startAt.getTime());
}

export function getNextReminderAt(window: CampaignWindow, now: Date): Date | null {
  const status = getCampaignStatusAt(window, now);
  if (status === "paused" || status === "closed") return null;

  const futureDates = Object.values(getReminderDates(window))
    .filter(date => date.getTime() > now.getTime())
    .sort((left, right) => left.getTime() - right.getTime());
  return futureDates[0] ?? null;
}

export function buildReminderIdempotencyKey(campaignId: number, participantId: number, type: CampaignReminderType): string {
  return `campaign:${campaignId}:participant:${participantId}:${type}`;
}

export function buildReminderCopy(input: { campaignTitle: string; endAt: Date; type: CampaignReminderType }): { title: string; message: string } {
  const endLabel = new Intl.DateTimeFormat("es-PY", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Asuncion",
  }).format(input.endAt);

  if (input.type === "opening") {
    return {
      title: `Comenzó la campaña: ${input.campaignTitle}`,
      message: `Tu evaluación ya está disponible. Podés completarla hasta el ${endLabel}.`,
    };
  }
  if (input.type === "midpoint") {
    return {
      title: `Recordatorio de campaña: ${input.campaignTitle}`,
      message: `La campaña sigue abierta. Reservá un momento para completar tu evaluación antes del ${endLabel}.`,
    };
  }
  return {
    title: `La campaña cierra en 48 horas: ${input.campaignTitle}`,
    message: `La ventana de evaluación cierra el ${endLabel}. Si aún está pendiente, completala antes del cierre.`,
  };
}
