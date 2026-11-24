"use client";
import { useSyncExternalStore } from "react";
import { dishes, type Cart } from "./menu";
type Draft = { id: string; cart: Cart; notes: string };
const key = "bigtree:table08",
  eventName = "table-tray-change";
const empty: Draft = { id: "", cart: {}, notes: "" };
let snapshot = empty,
  encoded: string | null = null;
function read() {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== encoded) {
      encoded = raw;
      snapshot = empty;
      if (raw) {
        const value = JSON.parse(raw);
        if (
          typeof value.id === "string" &&
          /^[a-f\d-]{36}$/i.test(value.id) &&
          typeof value.notes === "string" &&
          value.cart
        ) {
          const cart = Object.fromEntries(
            dishes
              .filter(
                (d) =>
                  Number.isInteger(value.cart[d.id]) &&
                  value.cart[d.id] > 0 &&
                  value.cart[d.id] <= 99,
              )
              .map((d) => [d.id, value.cart[d.id]]),
          );
          snapshot = { id: value.id, notes: value.notes.slice(0, 500), cart };
        }
      }
    }
  } catch {}
  return snapshot;
}
function subscribe(listener: () => void) {
  window.addEventListener(eventName, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(eventName, listener);
    window.removeEventListener("storage", listener);
  };
}
export function useDraft() {
  return useSyncExternalStore(subscribe, read, () => empty);
}
export function changeDraft(update: (draft: Draft) => Partial<Draft>) {
  const current = read();
  snapshot = { ...current, ...update(current), id: crypto.randomUUID() };
  try {
    const raw = JSON.stringify(snapshot);
    localStorage.setItem(key, raw);
    encoded = raw;
  } catch {}
  window.dispatchEvent(new Event(eventName));
}
