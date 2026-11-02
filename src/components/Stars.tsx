import { Star } from "lucide-react";

export function Stars({
  value,
  size = 14,
  onChange,
}: {
  value: number;
  size?: number;
  onChange?: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = value >= i - 0.25;
        const icon = (
          <Star
            style={{ width: size, height: size }}
            className={filled ? "fill-primary text-primary" : "text-muted-foreground/50"}
          />
        );
        return onChange ? (
          <button
            key={i}
            type="button"
            aria-label={`${i} stelle`}
            onClick={() => onChange(i)}
            className="p-1"
          >
            {icon}
          </button>
        ) : (
          <span key={i}>{icon}</span>
        );
      })}
    </div>
  );
}

export function StatusBadge({ status }: { status: "open" | "soon" | "closed" }) {
  const cls = {
    open: "bg-open/15 text-open",
    soon: "bg-soon/15 text-soon",
    closed: "bg-closed/20 text-muted-foreground",
  }[status];
  const label = { open: "Aperto ora", soon: "In arrivo", closed: "Chiuso" }[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${cls}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${status === "open" ? "animate-pulse bg-open" : status === "soon" ? "bg-soon" : "bg-closed"}`}
      />
      {label}
    </span>
  );
}
