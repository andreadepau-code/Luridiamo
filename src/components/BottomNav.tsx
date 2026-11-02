import { Link } from "@tanstack/react-router";
import { List, Map, MessageSquare } from "lucide-react";

const items = [
  { to: "/", label: "Mappa", icon: Map },
  { to: "/lista", label: "Lista", icon: List },
  { to: "/community", label: "Community", icon: MessageSquare },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto flex max-w-lg justify-around">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              className="group flex flex-col items-center gap-1 px-6 py-2.5 text-xs font-semibold text-muted-foreground"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: true }}
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-8 w-16 items-center justify-center rounded-full transition-colors ${isActive ? "bg-primary text-primary-foreground" : ""}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  {label}
                </>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
