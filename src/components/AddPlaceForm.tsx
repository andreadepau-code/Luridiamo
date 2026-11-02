import { lazy, Suspense, useRef, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, Crosshair, Plus } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { locateAddress, type Coordinates } from "@/lib/geocoding";
import { defaultWeek, normalizeSpecialties, savePlaceSchema, weekFor } from "@/lib/place-schedule";
import { savePublicPlace } from "@/lib/places.functions";
import type { Place } from "@/lib/places";
import { WeeklyHoursEditor } from "@/components/WeeklyHoursEditor";
import { Textarea } from "@/components/ui/textarea";

const LuridiMap = lazy(() => import("@/components/LuridiMap"));
const SPECIALS = [
  "Salamella",
  "Porchetta",
  "Cotoletta",
  "Piadina",
  "Hamburger",
  "Würstel",
  "Bombette",
  "Patatine",
];

export function AddPlaceForm({
  initial,
  onDone,
  place,
}: {
  initial: [number, number] | null;
  onDone: (id: string) => void;
  place?: Place;
}) {
  const qc = useQueryClient();
  const save = useServerFn(savePublicPlace);
  const [name, setName] = useState(place?.name ?? "");
  const [address, setAddress] = useState(place?.address ?? "");
  const [zone, setZone] = useState(place?.zone ?? "");
  const [description, setDescription] = useState(place?.description ?? "");
  const [week, setWeek] = useState(() => (place ? weekFor(place) : defaultWeek()));
  const [specials, setSpecials] = useState<string[]>(place?.specialties ?? []);
  const [customSpecial, setCustomSpecial] = useState("");
  const [options, setOptions] = useState(() =>
    normalizeSpecialties([...SPECIALS, ...(place?.specialties ?? [])]),
  );
  const [pos, setPos] = useState<[number, number] | null>(
    place ? [place.latitude, place.longitude] : initial,
  );
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const version = useRef(0);
  const lookup = useRef<{ address: string; promise: Promise<Coordinates | null> } | null>(null);

  const pickPosition = (point: Coordinates) => {
    version.current += 1;
    lookup.current = null;
    setLocating(false);
    setLocationMessage("");
    setPos(point);
  };

  const resolveAddress = (): Promise<Coordinates | null> => {
    const query = address.trim();
    if (!query) return Promise.resolve(pos);
    if (place && query === place.address?.trim() && pos) return Promise.resolve(pos);
    if (lookup.current?.address === query) return lookup.current.promise;
    const current = ++version.current;
    setLocating(true);
    setLocationMessage("Cerco l’indirizzo…");
    const promise = locateAddress(query)
      .then((point) => {
        if (current !== version.current) return null;
        setPos(point);
        setLocationMessage(
          point
            ? "Indirizzo trovato ✓"
            : "Indirizzo non trovato: aggiungi città e numero civico, oppure scegli sulla mappa.",
        );
        return point;
      })
      .catch(() => {
        if (current === version.current) {
          setPos(null);
          lookup.current = null;
          setLocationMessage("Ricerca non disponibile: riprova oppure scegli sulla mappa.");
        }
        return null;
      })
      .finally(() => {
        if (current === version.current) setLocating(false);
      });
    lookup.current = { address: query, promise };
    return promise;
  };

  const useGps = () =>
    navigator.geolocation.getCurrentPosition(
      (p) => pickPosition([p.coords.latitude, p.coords.longitude]),
      () => toast.error("GPS non disponibile, tocca la mappa"),
      { enableHighAccuracy: true, timeout: 10000 },
    );

  const submit = async () => {
    if (name.trim().length < 2) {
      toast.error("Dagli un nome");
      return;
    }
    setBusy(true);
    const point = pos ?? (await resolveAddress());
    if (!point) {
      setBusy(false);
      toast.error(
        address.trim()
          ? "Controlla l’indirizzo o scegli il punto sulla mappa"
          : "Inserisci l’indirizzo o scegli il punto sulla mappa",
      );
      return;
    }
    try {
      const payload = savePlaceSchema.safeParse({
        id: place?.id,
        name: name.trim(),
        latitude: point[0],
        longitude: point[1],
        address: address.trim() || null,
        zone: zone.trim() || null,
        description: description.trim() || null,
        weekly_hours: week,
        specialties: normalizeSpecialties([...specials, customSpecial]),
      });
      if (!payload.success) {
        toast.error("Controlla gli orari e i dati inseriti");
        return;
      }
      if (file) {
        const path = `${crypto.randomUUID()}.${file.name.split(".").pop() || "jpg"}`;
        const { error } = await supabase.storage
          .from("photos")
          .upload(path, file, { contentType: file.type });
        if (error) {
          toast.error("Non sono riuscito a caricare la foto. Riprova.");
          return;
        }
        payload.data.image_url = path;
      }
      const data = await save({ data: payload.data });
      await qc.invalidateQueries({ queryKey: ["places"] });
      toast.success(place ? "Modifiche salvate!" : "Lurido aggiunto alla mappa!");
      onDone(data.id);
    } catch {
      toast.error("Non sono riuscito a salvare. Riprova.");
    } finally {
      setBusy(false);
    }
  };

  const addSpecial = () => {
    const value = customSpecial.trim();
    if (!value) return;
    setOptions(normalizeSpecialties([...options, value]));
    setSpecials(normalizeSpecialties([...specials, value]));
    setCustomSpecial("");
  };

  return (
    <div className="space-y-4 px-5 pb-8">
      <div className="space-y-1.5">
        <Label htmlFor="n">Nome</Label>
        <Input
          id="n"
          placeholder="Es. Il Re della Salamella"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>Posizione</Label>
          <Button size="sm" variant="secondary" type="button" onClick={useGps}>
            <Crosshair /> Sono qui
          </Button>
        </div>
        <div className="isolate h-48 overflow-hidden rounded-2xl border border-border">
          <ClientOnly fallback={<div className="h-full bg-muted" />}>
            <Suspense fallback={<div className="h-full bg-muted" />}>
              <LuridiMap
                places={[]}
                pick={pos}
                onPick={pickPosition}
                flyTo={pos ? { center: pos, zoom: 16, key: 0 } : null}
              />
            </Suspense>
          </ClientOnly>
        </div>
        <p className="text-xs text-muted-foreground" role="status">
          {locationMessage ||
            (pos
              ? "Punto scelto ✓ — tocca per spostarlo"
              : "Inserisci un indirizzo oppure scegli il punto sulla mappa")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="z">Zona</Label>
          <Input
            id="z"
            placeholder="Navigli"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="a">Indirizzo</Label>
          <Input
            id="a"
            placeholder="Via Torino 1, Milano"
            value={address}
            onBlur={() => {
              void resolveAddress();
            }}
            onChange={(e) => {
              version.current += 1;
              lookup.current = null;
              setLocating(false);
              setLocationMessage("");
              setPos(null);
              setAddress(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Descrizione</Label>
        <Textarea
          id="description"
          value={description}
          maxLength={2000}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <WeeklyHoursEditor value={week} onChange={setWeek} />

      <div className="space-y-1.5">
        <Label>Specialità</Label>
        <div className="flex flex-wrap gap-2">
          {options.map((s) => {
            const on = specials.includes(s);
            return (
              <Button
                key={s}
                type="button"
                size="sm"
                aria-pressed={on}
                variant={on ? "chipActive" : "chip"}
                onClick={() => setSpecials(on ? specials.filter((x) => x !== s) : [...specials, s])}
              >
                {s}
              </Button>
            );
          })}
        </div>
        <div className="flex gap-2 pt-2">
          <Input
            aria-label="Nuova specialità"
            placeholder="Nuova specialità"
            maxLength={80}
            value={customSpecial}
            onChange={(e) => setCustomSpecial(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSpecial();
              }
            }}
          />
          <Button
            type="button"
            size="icon"
            aria-label="Aggiungi specialità"
            title="Aggiungi specialità"
            onClick={addSpecial}
            disabled={!customSpecial.trim()}
          >
            <Plus />
          </Button>
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-border bg-muted p-4 text-sm">
        <Camera className="h-5 w-5 text-primary" />
        <span className="truncate">
          {file
            ? file.name
            : place
              ? "Sostituisci foto (facoltativa)"
              : "Aggiungi una foto (facoltativa)"}
        </span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>

      <Button
        variant="grill"
        size="xl"
        className="w-full"
        onClick={submit}
        disabled={busy || locating}
      >
        {busy ? "Salvataggio…" : place ? "Salva modifiche" : "Aggiungi alla mappa"}
      </Button>
    </div>
  );
}
