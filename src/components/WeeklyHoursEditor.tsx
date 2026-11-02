import { DAYS, type WeeklyHours } from "@/lib/place-schedule";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function WeeklyHoursEditor({
  value,
  onChange,
}: {
  value: WeeklyHours;
  onChange: (value: WeeklyHours) => void;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold">Orari settimanali</h3>
      {DAYS.map(({ key, label }) => {
        const entry = value[key];
        const update = (patch: Partial<typeof entry>) =>
          onChange({ ...value, [key]: { ...entry, ...patch } });
        return (
          <div
            key={key}
            className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2 border-b border-border pb-3"
          >
            <div className="col-span-2 flex items-center justify-between gap-2">
              <Label htmlFor={`${key}-enabled`}>{label}</Label>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{entry.closed ? "Chiuso" : "Aperto"}</span>
                <Switch
                  id={`${key}-enabled`}
                  aria-label={`${label} aperto`}
                  checked={!entry.closed}
                  onCheckedChange={(checked) => update({ closed: !checked })}
                />
              </div>
            </div>
            {!entry.closed && (
              <>
                <div className="min-w-0 space-y-1">
                  <Label className="text-xs text-muted-foreground" htmlFor={`${key}-open`}>
                    Apre
                  </Label>
                  <Input
                    className="min-w-0 w-full"
                    id={`${key}-open`}
                    aria-label={`${label} apre`}
                    type="time"
                    required
                    value={entry.open}
                    onChange={(e) => update({ open: e.target.value })}
                  />
                </div>
                <div className="min-w-0 space-y-1">
                  <Label className="text-xs text-muted-foreground" htmlFor={`${key}-close`}>
                    Chiude
                  </Label>
                  <Input
                    className="min-w-0 w-full"
                    id={`${key}-close`}
                    aria-label={`${label} chiude`}
                    type="time"
                    required
                    value={entry.close}
                    onChange={(e) => update({ close: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>
        );
      })}
    </section>
  );
}
