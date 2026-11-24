"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Box, Rotate3D, Waves, Tent, Sailboat } from "lucide-react";
import CabanaBooking from "./CabanaBooking";
const Scene = dynamic(() => import("./LagoonScene3D"), {
  ssr: false,
  loading: () => <span className="scene-fallback">Preparing the lagoon…</span>,
});
const zones = [
    "Sunken Lagoon Pod",
    "Private Teepee Cabana",
    "Floating Boat Table",
  ],
  icons = [Waves, Tent, Sailboat];
export default function LagoonTour({ day }: { day: boolean }) {
  const [zone, setZone] = useState(-1),
    [ready, setReady] = useState(false),
    [active, setActive] = useState(false),
    stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!stage.current) return;
    const near = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setReady(true);
          near.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    const visible = new IntersectionObserver(([entry]) =>
      setActive(entry.isIntersecting),
    );
    near.observe(stage.current);
    visible.observe(stage.current);
    return () => {
      near.disconnect();
      visible.disconnect();
    };
  }, []);
  return (
    <section className="tour-section" id="seating">
      <div className="shell">
        <p className="eyebrow">
          <span />
          3D seating tour
        </p>
        <h2>
          Explore the <em>Lagoon</em>
        </h2>
        <div className="tour-grid">
          <div className="scene-card">
            <div className="stage" ref={stage}>
              {ready && <Scene active={active} zone={zone} day={day} />}
              <span className="orbit-hint">
                <Rotate3D size={15} />
                Drag to orbit
              </span>
              <button
                className="view-reset"
                onClick={() => setZone(-1)}
                aria-label="Show full lagoon"
              >
                <Box size={18} />
              </button>
            </div>
            <div className="zone-controls">
              {zones.map((name, i) => {
                const Icon = icons[i];
                return (
                  <button
                    aria-pressed={zone === i}
                    key={name}
                    onClick={() => setZone(i)}
                  >
                    <Icon size={16} />
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
          <CabanaBooking />
        </div>
      </div>
    </section>
  );
}
