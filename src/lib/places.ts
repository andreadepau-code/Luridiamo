import { queryOptions } from "@tanstack/react-query";
import { getPublicPlaces } from "./places.functions";
import { weeklyOpenAt, type SchedulePlace, type WeeklyHours } from "./place-schedule";

export type Review = {
  id: string;
  place_id: string;
  rating: number;
  comment: string | null;
  user_name: string;
  tags: string[];
  created_at: string;
};

export type Place = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string | null;
  zone: string | null;
  description: string | null;
  opening_hours: string;
  closing_hours: string;
  weekly_hours?: WeeklyHours | null;
  specialties: string[];
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  reviews: Review[];
};

export const MILANO: [number, number] = [45.4642, 9.19];
export const REVIEW_TAGS = [
  "Piastra sempre calda",
  "Salse a volontà",
  "Prezzi ok",
  "Poca coda",
  "Porzioni giganti",
];

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

/** Handles overnight ranges, e.g. 20:00 - 05:00. */
export function isOpenAt(open: string, close: string, date: Date): boolean {
  const now = date.getHours() * 60 + date.getMinutes();
  const o = toMin(open);
  const c = toMin(close);
  if (o === c) return true;
  return o < c ? now >= o && now < c : now >= o || now < c;
}

export type Status = "open" | "soon" | "closed";
export function statusAt(p: SchedulePlace, date: Date): Status {
  if (weeklyOpenAt(p, date)) return "open";
  const inAnHour = new Date(date.getTime() + 60 * 60 * 1000);
  if (weeklyOpenAt(p, inAnHour)) return "soon";
  return "closed";
}

/** True when the stand is still open past 03:00 at night. */
export function openAfter3(p: SchedulePlace, date = new Date()): boolean {
  const d = new Date(date);
  if (d.getHours() >= 12) d.setDate(d.getDate() + 1);
  d.setHours(3, 15, 0, 0);
  return weeklyOpenAt(p, d);
}

export function avgRating(reviews: Review[]): number {
  if (!reviews.length) return 0;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

export function distanceKm(a: [number, number], b: [number, number]) {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export const STATUS_LABEL: Record<Status, string> = {
  open: "Aperto ora",
  soon: "In arrivo",
  closed: "Chiuso",
};

export const placesQuery = queryOptions({
  queryKey: ["places"],
  queryFn: () => getPublicPlaces(),
  staleTime: 30_000,
  retry: 1,
});
