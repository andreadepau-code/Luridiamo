import { useEffect, useState } from "react";
import logo from "@/assets/luridiamo-logo.png";

export function OpeningLogo() {
  const [phase, setPhase] = useState<"visible" | "leaving" | "done">("visible");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const leave = window.setTimeout(() => setPhase("leaving"), reduced ? 250 : 1500);
    const done = window.setTimeout(() => setPhase("done"), reduced ? 300 : 2100);
    return () => {
      window.clearTimeout(leave);
      window.clearTimeout(done);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden="true"
      className={`opening-logo fixed inset-0 z-[100] grid place-items-center bg-background ${phase === "leaving" ? "opening-logo-leaving" : ""}`}
    >
      <img
        src={logo}
        alt=""
        width={280}
        height={340}
        fetchPriority="high"
        className="opening-logo-image w-[min(280px,65vw)] object-contain"
      />
    </div>
  );
}
