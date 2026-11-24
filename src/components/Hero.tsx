"use client";
import {
  ArrowDownRight,
  Box,
  MapPin,
  MoonStar,
  ScanLine,
  Sun,
  Waves,
} from "lucide-react";
export default function Hero({ day, onChange }: {
  day: boolean;
  onChange: (day: boolean, control: HTMLButtonElement) => void;
}) {
  return (
    <section
      className={"hero " + (day ? "is-day" : "")}
      aria-label="The lagoon at The Big Tree Cafe"
    >
      <div className="hero-photos overflow-hidden">
        {["night", "day"].map((mode) => (
          <img
            key={mode}
            className={
              "hero-photo scale-[1.12] object-center " +
              (mode === "day" ? "day-photo" : "")
            }
            src={"/images/lagoon-" + mode + ".jpg"}
            alt=""
            fetchPriority={mode === "night" ? "high" : "auto"}
          />
        ))}
      </div>
      <div className="hero-shade" />
      <div className="shell hero-inner">
        <div className="hero-copy">
          <p className="eyebrow hero-loc">
            <span />
            <MapPin size={13} /> Jaipur, Rajasthan
          </p>
          <h1>
            <span className="reveal">Dine Over</span>
            <em className="reveal">Turquoise Waters.</em>
            <span className="hero-line">Order Without Friction.</span>
          </h1>
          <div className="hero-actions">
            <a href="#menu" className="btn btn-gold">
              <ScanLine size={18} />
              Open Table QR Menu
              <ArrowDownRight size={16} />
            </a>
            <a href="#seating" className="btn btn-glass">
              <Box size={17} />
              Explore 3D Seating
            </a>
          </div>
        </div>
        <div className="hero-foot">
          <span className="scene-caption">
            <Waves size={19} />{" "}
            {day ? "Daylight on the lagoon" : "An evening by the lagoon"}
          </span>
          <div
            className="theme-switch"
            role="group"
            aria-label="Café lighting and theme"
          >
            <button aria-pressed={day} onClick={e => onChange(true, e.currentTarget)}>
              <Sun size={15} />
              Day Lagoon
            </button>
            <button aria-pressed={!day} onClick={e => onChange(false, e.currentTarget)}>
              <MoonStar size={15} />
              Starlit Night
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
