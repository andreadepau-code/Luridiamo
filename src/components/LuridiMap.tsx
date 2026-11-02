import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MILANO, type Place, type Status } from "@/lib/places";

type Props = {
  places: (Place & { status: Status })[];
  onSelect?: (id: string) => void;
  flyTo?: { center: [number, number]; zoom?: number; key: number } | null;
  me?: [number, number] | null;
  pick?: [number, number] | null;
  onPick?: (latlng: [number, number]) => void;
};

const pinIcon = (cls: string) =>
  L.divIcon({
    className: "",
    html: `<div class="lurido-pin ${cls}"><span>🥪</span></div>`,
    iconSize: [40, 40],
    iconAnchor: [4, 40],
  });

export default function LuridiMap({ places, onSelect, flyTo, me, pick, onPick }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const meLayer = useRef<L.Marker | null>(null);
  const pickLayer = useRef<L.Marker | null>(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!el.current) return;
    const m = L.map(el.current, { zoomControl: false, attributionControl: true }).setView(
      MILANO,
      13,
    );
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
      className: "dark-tiles",
    }).addTo(m);
    layer.current = L.layerGroup().addTo(m);
    m.on("click", (e) => onPickRef.current?.([e.latlng.lat, e.latlng.lng]));
    map.current = m;
    const ro = new ResizeObserver(() => m.invalidateSize());
    ro.observe(el.current);
    return () => {
      ro.disconnect();
      m.remove();
    };
  }, []);

  useEffect(() => {
    const g = layer.current;
    if (!g) return;
    g.clearLayers();
    for (const p of places) {
      L.marker([p.latitude, p.longitude], { icon: pinIcon(p.status), title: p.name })
        .on("click", () => onSelectRef.current?.(p.id))
        .addTo(g);
    }
  }, [places]);

  useEffect(() => {
    if (flyTo && map.current) map.current.flyTo(flyTo.center, flyTo.zoom ?? 16, { duration: 0.8 });
  }, [flyTo]);

  useEffect(() => {
    if (!map.current) return;
    meLayer.current?.remove();
    if (me) {
      meLayer.current = L.marker(me, {
        icon: L.divIcon({ className: "", html: '<div class="me-dot"></div>', iconSize: [18, 18] }),
        interactive: false,
      }).addTo(map.current);
    }
  }, [me]);

  useEffect(() => {
    if (!map.current) return;
    pickLayer.current?.remove();
    if (pick)
      pickLayer.current = L.marker(pick, { icon: pinIcon("pick"), interactive: false }).addTo(
        map.current,
      );
  }, [pick]);

  return <div ref={el} className="h-full w-full" aria-label="Mappa dei luridi" />;
}
