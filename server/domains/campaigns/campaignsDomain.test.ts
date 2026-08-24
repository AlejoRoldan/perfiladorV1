import { describe, expect, it } from "vitest";
import {
  assertCampaignWindow,
  buildReminderIdempotencyKey,
  getCampaignStatusAt,
  getDueReminderTypes,
  getNextReminderAt,
} from "./campaignsDomain";

const startAt = new Date("2026-09-01T12:00:00.000Z");
const endAt = new Date("2026-09-15T12:00:00.000Z");

describe("campaign reminder calendar", () => {
  it("rejects an invalid or too-short campaign window", () => {
    expect(() => assertCampaignWindow(endAt, startAt)).toThrow("cierre");
    expect(() => assertCampaignWindow(startAt, new Date("2026-09-01T18:00:00.000Z"))).toThrow("mínima");
  });

  it("derives scheduled, active and closed states from the calendar", () => {
    expect(getCampaignStatusAt({ startAt, endAt, status: "scheduled" }, new Date("2026-08-31T12:00:00.000Z"))).toBe("scheduled");
    expect(getCampaignStatusAt({ startAt, endAt, status: "scheduled" }, new Date("2026-09-04T12:00:00.000Z"))).toBe("active");
    expect(getCampaignStatusAt({ startAt, endAt, status: "active" }, new Date("2026-09-16T12:00:00.000Z"))).toBe("closed");
    expect(getCampaignStatusAt({ startAt, endAt, status: "scheduled" }, new Date("2026-08-31T12:00:00.000Z"))).not.toBe("active");
  });

  it("emits the three due milestones while the campaign is active", () => {
    expect(getDueReminderTypes({ startAt, endAt, status: "scheduled" }, new Date("2026-09-01T12:00:00.000Z"))).toEqual(["opening"]);
    expect(getDueReminderTypes({ startAt, endAt, status: "active" }, new Date("2026-09-08T12:00:00.000Z"))).toEqual(["opening", "midpoint"]);
    expect(getDueReminderTypes({ startAt, endAt, status: "active" }, new Date("2026-09-13T12:00:00.000Z"))).toEqual(["opening", "midpoint", "closing_48h"]);
  });

  it("never schedules messages for paused or closed campaigns", () => {
    expect(getDueReminderTypes({ startAt, endAt, status: "paused" }, new Date("2026-09-13T12:00:00.000Z"))).toEqual([]);
    expect(getDueReminderTypes({ startAt, endAt, status: "active" }, new Date("2026-09-16T12:00:00.000Z"))).toEqual([]);
  });

  it("returns the next future milestone and stable idempotency keys", () => {
    expect(getNextReminderAt({ startAt, endAt, status: "scheduled" }, new Date("2026-08-30T12:00:00.000Z"))?.toISOString()).toBe(startAt.toISOString());
    expect(buildReminderIdempotencyKey(17, 9, "midpoint")).toBe("campaign:17:participant:9:midpoint");
  });
});
