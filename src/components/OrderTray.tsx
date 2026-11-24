"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronUp,
  ConciergeBell,
  MessageCircle,
  X,
} from "lucide-react";
import { currency, itemsFor, totalFor, whatsapp, type Cart } from "@/lib/menu";
import { Stepper } from "./TableQRMenu";
type Props = {
  cart: Cart;
  adjust: (id: string, n: number) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  notes: string;
  setNotes: (s: string) => void;
  id: string;
  finish: () => void;
};
export default function OrderTray({
  cart,
  adjust,
  open,
  setOpen,
  notes,
  setNotes,
  id,
  finish,
}: Props) {
  const modal = useRef<HTMLDialogElement>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [receipt, setReceipt] = useState<{ ref: string; text: string } | null>(
      null,
    );
  const { count, subtotal, gst, total } = totalFor(cart),
    items = itemsFor(cart);
  const message =
    "The Big Tree Cafe · Table #08\n" +
    items
      .map(
        (d) =>
          d.quantity + " × " + d.name + " — " + currency(d.price * d.quantity),
      )
      .join("\n") +
    "\nSubtotal " +
    currency(subtotal) +
    " · GST " +
    currency(gst) +
    " · Total " +
    currency(total) +
    (notes ? "\nCooking notes: " + notes : "");
  useEffect(() => {
    const el = modal.current;
    if (open) {
      el?.showModal();
      document.body.style.overflow = "hidden";
    } else el?.close();
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  function close() {
    if (!busy) {
      setOpen(false);
      setError("");
      setReceipt(null);
    }
  }
  async function submit() {
    if (!count || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cart, notes, id }),
      });
      if (!response.ok) throw Error("Order failed");
      const { reference } = await response.json();
      setReceipt({ ref: reference, text: message + "\nOrder #" + reference });
      finish();
    } catch {
      setError(
        "Your order could not be confirmed. Your tray is saved. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button
        className="floating-tray"
        aria-label={"Open Table #08 Order Tray, " + count + " items"}
        onClick={() => setOpen(true)}
      >
        <ConciergeBell size={19} />
        <span>
          Table #08 <b>Order Tray</b>
        </span>
        <i>{count}</i>
        {count > 0 && <strong>{currency(subtotal)}</strong>}
        <ChevronUp size={15} />
      </button>
      <dialog
        className="tray-dialog"
        ref={modal}
        aria-labelledby="tray-title"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => {
          if (e.target === modal.current) close();
        }}
      >
        <div className="tray-panel">
          <div className="tray-head">
            <div>
              <p className="eyebrow terra">Table #08</p>
              <h2 id="tray-title">
                Order <em>Tray</em>
              </h2>
            </div>
            <button
              className="icon-button"
              disabled={busy}
              onClick={close}
              aria-label="Close order tray"
            >
              <X />
            </button>
          </div>
          {receipt ? (
            <div className="tray-empty" role="status">
              <Check size={34} />
              <h3>Order received.</h3>
              <p>Table #08 · Kitchen ticket #{receipt.ref}</p>
              <a
                className="btn btn-dark"
                href={whatsapp(receipt.text)}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={17} />
                Share on WhatsApp
              </a>
              <button className="text-btn" onClick={close}>
                Back to the table
              </button>
            </div>
          ) : !count ? (
            <div className="tray-empty">
              <ConciergeBell size={34} />
              <h3>Your tray is empty.</h3>
              <p>Choose a dish from the table menu to begin.</p>
              <a href="#menu" className="btn btn-dark" onClick={close}>
                Browse the menu
                <ArrowRight size={16} />
              </a>
            </div>
          ) : (
            <>
              <fieldset disabled={busy}>
                <div className="tray-items">
                  {items.map((d) => (
                    <div key={d.id} className="tray-item">
                      <div>
                        <strong>{d.name}</strong>
                        <small>{currency(d.price * d.quantity)}</small>
                      </div>
                      <Stepper dish={d} quantity={d.quantity} adjust={adjust} />
                    </div>
                  ))}
                </div>
                <label className="notes">
                  Cooking notes <span>(optional)</span>
                  <textarea
                    value={notes}
                    maxLength={500}
                    placeholder="Any preferences for the kitchen?"
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </label>
              </fieldset>
              <div className="totals">
                <p>
                  <span>Subtotal</span>
                  {currency(subtotal)}
                </p>
                <p>
                  <span>GST (5%)</span>
                  {currency(gst)}
                </p>
                <p className="grand">
                  <b>Total</b>
                  <b>{currency(total)}</b>
                </p>
              </div>
              {error && <p role="alert">{error}</p>}
              <button
                className="btn btn-dark send"
                disabled={busy}
                onClick={submit}
              >
                {busy ? "Sending order…" : "Send Order to Kitchen"}
                <ArrowRight size={17} />
              </button>
              <a
                className="wa"
                href={whatsapp(message)}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={16} />
                Share order on WhatsApp
              </a>
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
