import { describe, expect, it } from "vitest";
import {
  defaultWeek,
  hoursForDate,
  normalizeSpecialties,
  savePlaceSchema,
  weeklyOpenAt,
} from "./place-schedule";
import { openAfter3, statusAt } from "./places";

const monday = (hour: number) => new Date(2026, 9, 19, hour);
const tuesday = (hour: number) => new Date(2026, 9, 20, hour);
const place = () => ({
  opening_hours: "20:00",
  closing_hours: "04:00",
  weekly_hours: defaultWeek(),
});

describe("weekly schedules", () => {
  it("uses distinct hours for each weekday", () => {
    const p = place();
    p.weekly_hours.mon.open = "18:00";
    p.weekly_hours.tue.open = "22:00";
    expect(weeklyOpenAt(p, monday(19))).toBe(true);
    expect(weeklyOpenAt(p, tuesday(19))).toBe(false);
  });
  it("a closed day still includes the previous night's overnight tail", () => {
    const p = place();
    p.weekly_hours.tue.closed = true;
    expect(weeklyOpenAt(p, tuesday(2))).toBe(true);
    expect(weeklyOpenAt(p, tuesday(4))).toBe(false);
    expect(weeklyOpenAt(p, tuesday(21))).toBe(false);
  });
  it("never borrows today's closing time for the previous night", () => {
    const p = place();
    p.weekly_hours.mon.close = "01:00";
    p.weekly_hours.tue.close = "06:00";
    expect(weeklyOpenAt(p, tuesday(2))).toBe(false);
  });
  it("wraps Sunday overnight into Monday", () => {
    const p = place();
    p.weekly_hours.mon.closed = true;
    expect(weeklyOpenAt(p, monday(2))).toBe(true);
  });
  it("uses weekly hours for open and soon statuses", () => {
    const p = place();
    p.weekly_hours.mon.open = "18:00";
    expect(statusAt(p, monday(17))).toBe("soon");
    expect(statusAt(p, monday(19))).toBe("open");
  });
  it("late filter uses the upcoming night rather than any weekday", () => {
    const p = place();
    p.weekly_hours.mon.close = "03:00";
    p.weekly_hours.tue.close = "06:00";
    expect(openAfter3(p, monday(21))).toBe(false);
    expect(openAfter3(p, tuesday(21))).toBe(true);
  });
  it("preserves legacy hours when no weekly schedule exists", () => {
    expect(weeklyOpenAt({ opening_hours: "20:00", closing_hours: "04:00" }, tuesday(2))).toBe(true);
  });
  it("shows the previous opening day's hours during its overnight tail", () => {
    const p = place();
    p.weekly_hours.mon.close = "05:00";
    p.weekly_hours.tue.closed = true;
    expect(hoursForDate(p, tuesday(2))).toBe("20:00–05:00");
  });
});
describe("place editing values", () => {
  it("supports custom specialties and removal without duplicate names", () => {
    expect(normalizeSpecialties([" Arrosticini ", "arrosticini", "Porchetta", ""])).toEqual([
      "Arrosticini",
      "Porchetta",
    ]);
    expect(normalizeSpecialties(["Arrosticini"])).not.toContain("Porchetta");
  });
  it("validates all seven daily hours before edits can be saved", () => {
    const values = {
      name: "Lurido",
      latitude: 45,
      longitude: 9,
      address: null,
      zone: null,
      description: null,
      specialties: ["Arrosticini"],
      weekly_hours: defaultWeek(),
    };
    expect(savePlaceSchema.safeParse(values).success).toBe(true);
    expect(
      savePlaceSchema.safeParse({
        ...values,
        weekly_hours: {
          ...values.weekly_hours,
          mon: { closed: false, open: "25:00", close: "04:00" },
        },
      }).success,
    ).toBe(false);
  });
});
