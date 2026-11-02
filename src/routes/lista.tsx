import { createFileRoute, ClientOnly, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronRight, Clock } from "lucide-react";
import { avgRating, placesQuery, statusAt } from "@/lib/places";
import { Stars, StatusBadge } from "@/components/Stars";
import { BottomNav } from "@/components/BottomNav";
import { BrandLogo } from "@/components/BrandLogo";
import panino from "@/assets/panino.jpg";
import { hoursForDate } from "@/lib/place-schedule";

export const Route = createFileRoute("/lista")({
  head: () => ({
    meta: [
      { title: "Tutti i luridi di Milano — Luridiamo" },
      {
        name: "description",
        content:
          "L'elenco dei baracchini e paninari notturni di Milano, con orari, specialità e voti.",
      },
      { property: "og:title", content: "Tutti i luridi di Milano — Luridiamo" },
      {
        property: "og:description",
        content: "Elenco dei paninari notturni di Milano con orari e recensioni.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(placesQuery),
  component: Lista,
});

function Lista() {
  const { data } = useSuspenseQuery(placesQuery);
  return (
    <main className="min-h-dvh bg-background pb-28">
      <header className="px-5 pb-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <div className="mb-3">
          <BrandLogo />
        </div>
        <h1 className="text-3xl font-extrabold">Tutti i luridi</h1>
      </header>
      <ClientOnly fallback={<div className="mx-4 h-40 animate-pulse rounded-3xl bg-muted" />}>
        <ul className="mx-auto max-w-lg space-y-3 px-4">
          {data
            .map((p) => ({ p, s: statusAt(p, new Date()), r: avgRating(p.reviews) }))
            .sort((a, b) => Number(b.s === "open") - Number(a.s === "open") || b.r - a.r)
            .map(({ p, s, r }) => (
              <li key={p.id}>
                <Link
                  to="/"
                  search={{ place: p.id }}
                  className="flex gap-3 rounded-3xl border border-border bg-card p-3 shadow-card"
                >
                  <img
                    src={p.image_url || panino}
                    alt=""
                    loading="lazy"
                    width={1024}
                    height={640}
                    className="h-20 w-20 shrink-0 rounded-2xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate font-bold">{p.name}</h2>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.zone} · {p.specialties.slice(0, 2).join(", ")}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <StatusBadge status={s} />
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {hoursForDate(p, new Date())}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs">
                      <Stars value={r} size={11} /> {r ? r.toFixed(1) : "—"}
                    </div>
                  </div>
                  <ChevronRight className="self-center text-muted-foreground" />
                </Link>
              </li>
            ))}
        </ul>
      </ClientOnly>
      <BottomNav />
    </main>
  );
}
