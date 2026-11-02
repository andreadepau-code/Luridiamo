import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Clock, MapPin, Navigation, Pencil, Trash2, Utensils } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { avgRating, REVIEW_TAGS, statusAt, type Place } from "@/lib/places";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Stars, StatusBadge } from "@/components/Stars";
import truck from "@/assets/truck.jpg";
import { AddPlaceForm } from "@/components/AddPlaceForm";
import { DAYS, weekFor } from "@/lib/place-schedule";
import { researchedPlaces } from "@/lib/researched-places";

export function PlaceDetail({ place }: { place: Place }) {
  const [editing, setEditing] = useState(false);
  const status = statusAt(place, new Date());
  const week = weekFor(place);
  const provenance = researchedPlaces[place.id];
  const avg = avgRating(place.reviews);
  const tagCounts = REVIEW_TAGS.map(
    (t) => [t, place.reviews.filter((r) => r.tags.includes(t)).length] as const,
  )
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);

  const directions = () => {
    const isApple = /iPhone|iPad|Mac/.test(navigator.userAgent);
    const url = isApple
      ? `https://maps.apple.com/?daddr=${place.latitude},${place.longitude}`
      : `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
    window.open(url, "_blank");
  };

  if (editing)
    return (
      <div className="pb-6">
        <div className="flex items-center gap-3 px-5 pb-4">
          <Button
            size="icon"
            variant="ghost"
            aria-label="Annulla modifiche"
            title="Annulla modifiche"
            onClick={() => setEditing(false)}
          >
            <ArrowLeft />
          </Button>
          <h2 className="text-xl font-bold">Modifica lurido</h2>
        </div>
        <AddPlaceForm
          key={place.id}
          place={place}
          initial={null}
          onDone={() => setEditing(false)}
        />
      </div>
    );

  return (
    <div className="pb-6">
      <div className="relative mx-4 overflow-hidden rounded-3xl">
        <img
          src={place.image_url || truck}
          alt={place.name}
          width={1024}
          height={640}
          className="aspect-[16/9] w-full object-cover"
        />
        <div className="absolute left-3 top-3">
          <StatusBadge status={status} />
        </div>
      </div>
      {!place.image_url && (
        <p className="px-5 pt-2 text-xs text-muted-foreground">
          Immagine illustrativa · foto del locale non disponibile
        </p>
      )}

      <div className="space-y-5 px-5 pt-4">
        <div>
          <h2 className="text-2xl font-extrabold">{place.name}</h2>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Stars value={avg} />
            <span className="font-semibold text-foreground">{avg ? avg.toFixed(1) : "—"}</span>
            <span>({place.reviews.length} recensioni)</span>
          </div>
        </div>

        <div className="grid gap-2 text-sm">
          <div className="flex items-start gap-3 rounded-2xl bg-muted p-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <div className="font-semibold">{place.zone ?? "Milano"}</div>
              <div className="text-muted-foreground">{place.address}</div>
            </div>
          </div>
          <section className="space-y-2 border-y border-border py-3">
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              <Clock className="h-4 w-4 text-primary" />
              Orari settimanali
            </h3>
            {DAYS.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">{label}</span>
                <span className="text-right font-semibold">
                  {week[key].closed ? "Chiuso" : `${week[key].open} – ${week[key].close}`}
                </span>
              </div>
            ))}
          </section>
          {provenance && (
            <section className="space-y-2 text-xs text-muted-foreground">
              <h3 className="font-semibold text-foreground">
                Fonti consultate · {provenance.checkedAt}
              </h3>
              <p className="leading-relaxed">{provenance.note}</p>
              <div className="flex flex-col items-start gap-2">
                {provenance.sources.map((source) => (
                  <a
                    key={source.url}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-4"
                  >
                    {source.label}
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>

        <Button variant="grill" size="xl" className="w-full" onClick={directions}>
          <Navigation /> Portami qui
        </Button>
        <Button variant="outline" className="w-full" onClick={() => setEditing(true)}>
          <Pencil /> Modifica questo lurido
        </Button>

        {place.description && (
          <p className="text-sm leading-relaxed text-muted-foreground">{place.description}</p>
        )}

        {place.specialties.length > 0 && (
          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              <Utensils className="h-4 w-4" /> Specialità
            </h3>
            <div className="flex flex-wrap gap-2">
              {place.specialties.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary"
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {tagCounts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tagCounts.map(([t, n]) => (
              <span key={t} className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                ✓ {t} · {n}
              </span>
            ))}
          </div>
        )}

        <ReviewForm placeId={place.id} />

        <section className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Recensioni
          </h3>
          {place.reviews.length === 0 && (
            <p className="text-sm text-muted-foreground">Nessuna recensione. Sii il primo!</p>
          )}
          {place.reviews.map((r) => (
            <div key={r.id} className="rounded-2xl bg-muted p-4">
              <div className="flex items-center justify-between">
                <span className="font-bold">{r.user_name}</span>
                <Stars value={r.rating} size={12} />
              </div>
              {r.comment && <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>}
              {r.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {r.tags.map((t) => (
                    <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-[11px]">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>

        <DeletePlace place={place} />
      </div>
    </div>
  );
}

function ReviewForm({ placeId }: { placeId: string }) {
  const qc = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!rating) {
      toast.error("Dai almeno una stella");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("reviews").insert({
      place_id: placeId,
      rating,
      comment: comment.trim().slice(0, 500) || null,
      user_name: name.trim().slice(0, 40) || "Anonimo",
      tags,
    });
    setBusy(false);
    if (error) {
      toast.error("Non è andata, riprova");
      return;
    }
    toast.success("Grazie, lurido!");
    setRating(0);
    setComment("");
    setTags([]);
    qc.invalidateQueries({ queryKey: ["places"] });
  };

  return (
    <section className="space-y-3 rounded-3xl border border-border bg-card p-4">
      <h3 className="font-bold">Com'era?</h3>
      <Stars value={rating} size={28} onChange={setRating} />
      <div className="flex flex-wrap gap-2">
        {REVIEW_TAGS.map((t) => {
          const on = tags.includes(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTags(on ? tags.filter((x) => x !== t) : [...tags, t])}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary"}`}
            >
              {on ? "✓ " : ""}
              {t}
            </button>
          );
        })}
      </div>
      <Input
        placeholder="Il tuo nome (facoltativo)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={40}
      />
      <Textarea
        placeholder="Racconta la tua salamella…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
      />
      <Button className="w-full" onClick={submit} disabled={busy}>
        {busy ? "Invio…" : "Pubblica recensione"}
      </Button>
    </section>
  );
}

function DeletePlace({ place }: { place: Place }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const remove = async () => {
    setBusy(true);
    const { error } = await supabase.from("places").update({ is_active: false }).eq("id", place.id);
    setBusy(false);
    if (error) {
      toast.error("Non sono riuscito a cancellarlo");
      return;
    }
    toast.success(`${place.name} cancellato`);
    await qc.invalidateQueries({ queryKey: ["places"] });
    navigate({ to: ".", search: {} as never, replace: true });
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="w-full text-destructive" disabled={busy}>
          <Trash2 /> Cancella questo lurido
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancellare {place.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            Sparirà dalla mappa e dalla lista per tutti.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annulla</AlertDialogCancel>
          <AlertDialogAction
            onClick={remove}
            className="bg-destructive text-destructive-foreground"
          >
            Cancella
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
