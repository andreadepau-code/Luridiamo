import { Link } from "@tanstack/react-router";
import logo from "@/assets/luridiamo-logo.png";

export function BrandLogo() {
  return (
    <Link
      to="/"
      search={{}}
      aria-label="Luridiamo — Mappa"
      className="pointer-events-auto block shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-ring"
    >
      <img
        src={logo}
        alt="LuridiAMO"
        width={64}
        height={78}
        className="h-[78px] w-16 object-contain"
      />
    </Link>
  );
}
