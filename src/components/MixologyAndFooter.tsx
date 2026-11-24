"use client";
import { ArrowUpRight, Clock3, MapPin, Martini } from "lucide-react";
import { Brand } from "./Navbar";
export default function MixologyAndFooter({
  openBar,
}: {
  openBar: () => void;
}) {
  return (
    <>
      <section className="bar-section" id="bar">
        <div className="shell bar-wrap">
          <div className="bar-photo">
            <img
              src="/images/cocktail-smoke.jpg"
              alt="Smoke rising from a rosemary and orange cocktail in a coupe"
              loading="lazy"
            />
          </div>
          <div className="bar-copy">
            <p className="eyebrow">
              <Martini size={15} />
              The craft bar
            </p>
            <h2>
              Handcrafted &amp; <em>Smoked at the Bar</em>
            </h2>
            <p>
              Rosemary smoke curls over citrus and amber. Discover the signature
              pours at our lagoon-side bar.
            </p>
            <button className="bar-link" onClick={openBar}>
              Explore the drinks
              <ArrowUpRight size={17} />
            </button>
          </div>
        </div>
      </section>
      <footer>
        <div className="shell footer-inner">
          <Brand />
          <p>
            <MapPin size={16} />
            Plot 8, Ajmer Road, Karni Vihar, Jaipur
          </p>
          <p>
            <Clock3 size={16} />
            Daily · 12:00 PM – 12:00 AM
          </p>
        </div>
      </footer>
    </>
  );
}
