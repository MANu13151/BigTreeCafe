"use client";
import { useState } from "react";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { whatsapp } from "@/lib/menu";
const packages = [
  "Candlelight Rose-Petal Setup",
  "Anniversary Neon & Cake",
  "Group Lagoon Pod",
];
export default function CabanaBooking() {
  const [choice, setChoice] = useState(packages[0]);
  return (
    <article className="booking" id="cabanas">
      <img
        src="/images/cabana-anniversary.jpg"
        alt="Candlelit white cabana decorated with rose petals for an anniversary"
        loading="lazy"
      />
      <div className="booking-content">
        <p className="eyebrow">Private dining</p>
        <h3>
          Candlelight &amp; <em>Anniversary Cabana</em>
        </h3>
        <label>
          Choose your package
          <select value={choice} onChange={(e) => setChoice(e.target.value)}>
            {packages.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <a
          className="btn btn-gold"
          href={whatsapp(
            "Hello The Big Tree Cafe Jaipur, I would like to reserve the " +
              choice +
              " package. Please share availability.",
          )}
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle size={16} />
          Reserve on WhatsApp
          <ArrowUpRight size={15} />
        </a>
      </div>
    </article>
  );
}
