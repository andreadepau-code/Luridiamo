import { lazy, Suspense, useMemo, useState } from "react";
import { createFileRoute, ClientOnly, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { LocateFixed, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { distanceKm, placesQuery, statusAt } from "@/lib/places";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { PlaceDetail } from "@/components/PlaceDetail";
import { AddPlaceForm } from "@/components/AddPlaceForm";
import { BottomNav } from "@/components/BottomNav";
import { BrandLogo } from "@/components/BrandLogo";

const LuridiMap = lazy(() => import("@/components/LuridiMap"));

export const Route = createFileRoute("/")({
  validateSearch: z.object({ place: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Luridiamo — La mappa dei baracchini notturni di Milano" },
      {
        name: "description",
        content:
          "Trova il paninaro aperto più vicino a te: salamelle, porchetta e luridi notturni di Milano, recensiti dalla community.",
      },
      { property: "og:title", content: "Luridiamo — I baracchini notturni di Milano" },
      {
        property: "og:description",
        content: "La mappa community dei paninari notturni di Milano. Chi è aperto adesso?",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(placesQuery),
  component: Home,
});

function Home() {
  const { data } = useSuspenseQuery(placesQuery);
  const { place: selectedId } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const [q, setQ] = useState("");
  const [flyTo, setFlyTo] = useState<{
    center: [number, number];
    zoom?: number;
    key: number;
  } | null>(null);
  const [me, setMe] = useState<[number, number] | null>(null);
  const [adding, setAdding] = useState(false);

  const now = new Date();
  const places = useMemo(() => {
    let list = data.map((p) => ({ ...p, status: statusAt(p, now) }));
    const t = q.trim().toLowerCase();
    if (t)
      list = list.filter((p) =>
        [p.name, p.zone, p.address, ...p.specialties].join(" ").toLowerCase().includes(t),
      );
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, q]);

  const selected = data.find((p) => p.id === selectedId);
  const select = (id: string | undefined) =>
    navigate({ search: id ? { place: id } : {}, replace: true });

  const findNearest = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalizzazione non supportata");
      return;
    }
    toast("Cerco il lurido più vicino…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setMe(here);
        const pool = data.map((p) => ({ ...p, status: statusAt(p, new Date()) }));
        const openOnes = pool.filter((p) => p.status === "open");
        const candidates = openOnes.length ? openOnes : pool;
        const best = candidates
          .map((p) => ({ p, d: distanceKm(here, [p.latitude, p.longitude]) }))
          .sort((a, b) => a.d - b.d)[0];
        if (!best) return;
        setFlyTo({ center: [best.p.latitude, best.p.longitude], zoom: 16, key: Date.now() });
        toast.success(`${best.p.name} · ${best.d.toFixed(1)} km`);
        select(best.p.id);
      },
      () => toast.error("Non riesco a trovarti. Attiva il GPS."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <main className="fixed inset-0 overflow-hidden bg-background">
      <div className="absolute inset-0 isolate z-0">
        <ClientOnly fallback={<div className="h-full w-full bg-muted" />}>
          <Suspense fallback={<div className="h-full w-full bg-muted" />}>
            <LuridiMap
              places={places}
              me={me}
              flyTo={flyTo}
              onSelect={(id) => {
                const p = data.find((x) => x.id === id);
                if (p) setFlyTo({ center: [p.latitude, p.longitude], zoom: 15, key: Date.now() });
                select(id);
              }}
            />
          </Suspense>
        </ClientOnly>
      </div>

      {/* Top: brand + search */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 space-y-3 bg-gradient-to-b from-background via-background/70 to-transparent px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <BrandLogo />
          <div className="pointer-events-auto flex min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 shadow-card">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cerca lurido, zona, panino…"
              className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              aria-label="Cerca"
            />
          </div>
        </div>
      </header>

      {/* Count pill */}
      <ClientOnly>
        <div className="absolute bottom-28 left-4 z-10 rounded-full bg-card/90 px-3 py-1.5 text-xs font-semibold shadow-card backdrop-blur">
          {places.filter((p) => p.status === "open").length} aperti · {places.length} luridi
        </div>
      </ClientOnly>

      {/* Actions */}
      <div className="absolute bottom-28 right-4 z-10 flex flex-col items-end gap-3">
        <Button variant="chip" size="lg" onClick={findNearest} className="h-12">
          <LocateFixed /> Trova il più vicino
        </Button>
        <Button
          variant="grill"
          size="fab"
          onClick={() => setAdding(true)}
          aria-label="Aggiungi lurido"
        >
          <Plus /> Aggiungi Lurido
        </Button>
      </div>

      <BottomNav />

      <Drawer open={!!selected} onOpenChange={(o) => !o && select(undefined)}>
        <DrawerContent className="mx-auto max-w-lg">
          <DrawerTitle className="sr-only">{selected?.name ?? "Dettaglio"}</DrawerTitle>
          <DrawerDescription className="sr-only">Dettagli del baracchino</DrawerDescription>
          <div className="overflow-y-auto">{selected && <PlaceDetail place={selected} />}</div>
        </DrawerContent>
      </Drawer>

      <Drawer open={adding} onOpenChange={setAdding} handleOnly>
        <DrawerContent className="mx-auto max-w-lg">
          <div className="px-5 pb-3">
            <DrawerTitle className="font-display text-2xl font-extrabold">
              Aggiungi un lurido
            </DrawerTitle>
            <DrawerDescription>Segnala un baracchino alla community.</DrawerDescription>
          </div>
          <div className="overflow-y-auto">
            {adding && (
              <AddPlaceForm
                initial={me}
                onDone={(id) => {
                  setAdding(false);
                  select(id);
                }}
              />
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </main>
  );
}
