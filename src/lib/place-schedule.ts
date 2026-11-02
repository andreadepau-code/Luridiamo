import { z } from "zod";

export const DAYS = [
  { key: "mon", label: "Lunedì" },
  { key: "tue", label: "Martedì" },
  { key: "wed", label: "Mercoledì" },
  { key: "thu", label: "Giovedì" },
  { key: "fri", label: "Venerdì" },
  { key: "sat", label: "Sabato" },
  { key: "sun", label: "Domenica" },
] as const;
export type DayKey = (typeof DAYS)[number]["key"];
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const daySchema = z.object({ closed: z.boolean(), open: time, close: time });
export const weeklyHoursSchema = z.object({
  mon: daySchema,
  tue: daySchema,
  wed: daySchema,
  thu: daySchema,
  fri: daySchema,
  sat: daySchema,
  sun: daySchema,
});
export type WeeklyHours = z.infer<typeof weeklyHoursSchema>;
export type SchedulePlace = {
  opening_hours: string;
  closing_hours: string;
  weekly_hours?: WeeklyHours | null;
};

export function defaultWeek(open = "20:00", close = "04:00"): WeeklyHours {
  return Object.fromEntries(
    DAYS.map(({ key }) => [key, { closed: false, open, close }]),
  ) as WeeklyHours;
}
export function weekFor(place: SchedulePlace): WeeklyHours {
  return place.weekly_hours ?? defaultWeek(place.opening_hours, place.closing_hours);
}
const minutes = (value: string) => {
  const [h = 0, m = 0] = value.split(":").map(Number);
  return h * 60 + m;
};
const dayKey = (index: number): DayKey => DAYS[(index + 6) % 7]?.key ?? "mon";

/** Schedules belong to the opening day, including their next-day overnight tail. */
export function weeklyOpenAt(place: SchedulePlace, date: Date): boolean {
  const week = weekFor(place);
  const current = week[dayKey(date.getDay())];
  const previous = week[dayKey((date.getDay() + 6) % 7)];
  const now = date.getHours() * 60 + date.getMinutes();
  const o = minutes(current.open),
    c = minutes(current.close);
  if (!current.closed && (c > o ? now >= o && now < c : now >= o)) return true;
  const po = minutes(previous.open),
    pc = minutes(previous.close);
  return !previous.closed && pc <= po && now < pc;
}

export function hoursForDate(place: SchedulePlace, date: Date): string {
  const week = weekFor(place);
  const current = week[dayKey(date.getDay())];
  const previous = week[dayKey((date.getDay() + 6) % 7)];
  const now = date.getHours() * 60 + date.getMinutes();
  const entry =
    !previous.closed &&
    minutes(previous.close) <= minutes(previous.open) &&
    now < minutes(previous.close)
      ? previous
      : current;
  return entry.closed ? "Chiuso oggi" : `${entry.open}–${entry.close}`;
}

export function normalizeSpecialties(values: string[]): string[] {
  const seen = new Set<string>();
  return values
    .map((v) => v.trim())
    .filter((value) => {
      const key = value.toLocaleLowerCase("it");
      if (!value || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export const savePlaceSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(80),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().trim().max(300).nullable(),
  zone: z.string().trim().max(100).nullable(),
  description: z.string().trim().max(2000).nullable(),
  weekly_hours: weeklyHoursSchema,
  specialties: z.array(z.string().trim().min(1).max(80)).max(50).transform(normalizeSpecialties),
  image_url: z.string().max(500).optional(),
});
