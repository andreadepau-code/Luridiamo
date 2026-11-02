import { describe, expect, it } from "vitest";
import { isOpenAt, openAfter3, statusAt } from "./places";

const at = (h: number, m = 0) => new Date(2026, 9, 17, h, m);

describe("orari notturni", () => {
  it("20:00-05:00 è aperto alle 02:00", () => expect(isOpenAt("20:00", "05:00", at(2))).toBe(true));
  it("20:00-05:00 è chiuso alle 12:00", () =>
    expect(isOpenAt("20:00", "05:00", at(12))).toBe(false));
  it("in arrivo un'ora prima dell'apertura", () =>
    expect(statusAt({ opening_hours: "20:00", closing_hours: "05:00" }, at(19, 15))).toBe("soon"));
  it("aperto dopo le 3 solo se chiude dopo le 3", () => {
    expect(openAfter3({ opening_hours: "21:00", closing_hours: "03:00" })).toBe(false);
    expect(openAfter3({ opening_hours: "20:00", closing_hours: "06:00" })).toBe(true);
  });
});
