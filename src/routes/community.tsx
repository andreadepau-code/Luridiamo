import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { placesQuery } from "@/lib/places";
import { Stars } from "@/components/Stars";
import { BottomNav } from "@/components/BottomNav";
import { BrandLogo } from "@/components/BrandLogo";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — Luridiamo" },
      {
        name: "description",
        content: "Le ultime recensioni della community sui baracchini notturni di Milano.",
      },
      { property: "og:title", content: "Community — Luridiamo" },
      {
        property: "og:description",
        content: "Cosa dicono i luridi di Milano: ultime recensioni e voti.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(placesQuery),
  component: Community,
});

function Community() {
  const { data } = useSuspenseQuery(placesQuery);
  const reviews = data
    .flatMap((p) => p.reviews.map((r) => ({ ...r, place: p })))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 50);

  return (
    <main className="min-h-dvh bg-background pb-28">
      <header className="px-5 pb-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <div className="mb-3">
          <BrandLogo />
        </div>
        <h1 className="text-3xl font-extrabold">La voce dei luridi</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {reviews.length} recensioni dalla notte milanese
        </p>
      </header>
      <ul className="mx-auto max-w-lg space-y-3 px-4">
        {reviews.map((r) => (
          <li key={r.id}>
            <Link
              to="/"
              search={{ place: r.place.id }}
              className="block rounded-3xl border border-border bg-card p-4 shadow-card"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-bold text-primary">{r.place.name}</span>
                <Stars value={r.rating} size={12} />
              </div>
              {r.comment && <p className="mt-2 text-sm">“{r.comment}”</p>}
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-semibold">— {r.user_name}</span>
                {r.tags.map((t) => (
                  <span key={t} className="rounded-full bg-secondary px-2 py-0.5">
                    {t}
                  </span>
                ))}
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <BottomNav />
    </main>
  );
}
