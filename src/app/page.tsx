"use client";
import { useState } from "react";
import { flushSync } from "react-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TableQRMenu from "@/components/TableQRMenu";
import LagoonTour from "@/components/LagoonTour";
import MixologyAndFooter from "@/components/MixologyAndFooter";
import OrderTray from "@/components/OrderTray";
import { totalFor } from "@/lib/menu";
import { useDraft, changeDraft } from "@/lib/draft";
export default function Home() {
  const draft = useDraft(),
    [open, setOpen] = useState(false),
    [menuView, setMenuView] = useState({ category: 0, version: 0 });
  const [day, setDay] = useState(false);

  function changeLighting(nextDay: boolean, control: HTMLButtonElement) {
    if (nextDay === day) return;
    if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDay(nextDay);
      return;
    }

    const bounds = control.getBoundingClientRect();
    const x = bounds.left + bounds.width / 2;
    const y = bounds.top + bounds.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const style = document.documentElement.style;
    style.setProperty("--ripple-x", x + "px");
    style.setProperty("--ripple-y", y + "px");
    style.setProperty("--ripple-end", Math.ceil(radius + 55) + "px");
    document.startViewTransition(() => flushSync(() => setDay(nextDay)));
  }

  function adjust(id: string, delta: number) {
    changeDraft((prev) => {
      const cart = { ...prev.cart },
        quantity = Math.min(99, (cart[id] || 0) + delta);
      if (quantity > 0) cart[id] = quantity;
      else delete cart[id];
      return { cart };
    });
  }
  return (
    <div data-theme={day ? "day" : "night"}>
      <a className="skip-link" href="#menu">
        Skip to table menu
      </a>
      <Navbar
        count={totalFor(draft.cart).count}
        openTray={() => setOpen(true)}
      />
      <main>
        <Hero day={day} onChange={changeLighting} />
        <TableQRMenu
          key={menuView.version}
          initialCategory={menuView.category}
          cart={draft.cart}
          adjust={adjust}
        />
        <LagoonTour day={day} />
        <MixologyAndFooter
          openBar={() => {
            setMenuView((v) => ({ category: 4, version: v.version + 1 }));
            location.hash = "menu";
            document.getElementById("menu")?.scrollIntoView();
          }}
        />
      </main>
      <OrderTray
        {...draft}
        adjust={adjust}
        open={open}
        setOpen={setOpen}
        setNotes={(notes) => changeDraft(() => ({ notes }))}
        finish={() => changeDraft(() => ({ cart: {}, notes: "" }))}
      />
    </div>
  );
}
