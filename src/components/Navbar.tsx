"use client";
import { useRef } from "react";
import { ConciergeBell, Menu, X } from "lucide-react";
const links = [
  ["Table QR Menu", "menu"],
  ["3D Seating", "seating"],
  ["Cabanas", "cabanas"],
  ["Craft Bar", "bar"],
];
export function Brand() {
  return (
    <a href="#top" className="brand" aria-label="The Big Tree Cafe, home">
      <svg
        className="brand-tree"
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        aria-hidden="true"
      >
        <path d="M7 32c-7-2-5-10 1-11-2-5 2-10 7-9 0-7 8-9 12-5 5-4 12-1 12 5 6 1 8 6 5 10 5 6 0 12-6 11-4 3-9 2-12-1M20 45c4-6 3-16 1-23m7 23c-3-7-3-18 0-27M22 32l-9-9m12 5 10-9M24 23l-6-9m8 8 4-10M16 45q8-3 16 0" />
        <path d="M6 27q4 5 10 3m14 1q6 2 10-2M9 18q4-4 8-2m15-2q4-1 6 3" />
      </svg>
      <span>
        <b>THE BIG TREE CAFE</b>
        <small>JAIPUR • LAGOON &amp; CABANA BISTRO</small>
      </span>
    </a>
  );
}
export default function Navbar({
  count,
  openTray,
}: {
  count: number;
  openTray: () => void;
}) {
  const menu = useRef<HTMLDialogElement>(null);
  return (
    <header className="navbar" id="top">
      <div className="shell navinner">
        <Brand />
        <nav
          className="main-nav whitespace-nowrap"
          aria-label="Main navigation"
        >
          {links.map(([label, id]) => (
            <a key={id} href={"#" + id}>
              {label}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <span className="table-badge">
            <i />
            Table #08
          </span>
          <button
            className="nav-tray"
            aria-label={`Order Tray, ${count} items`}
            onClick={openTray}
          >
            <ConciergeBell size={17} />
            <span>Order Tray</span>
            <b>{count}</b>
          </button>
          <button
            className="mobile-menu icon-button"
            aria-label="Open navigation"
            onClick={() => menu.current?.showModal()}
          >
            <Menu />
          </button>
        </div>
        <dialog ref={menu} className="mobile-dialog">
          <button
            className="icon-button"
            aria-label="Close navigation"
            onClick={() => menu.current?.close()}
          >
            <X />
          </button>
          <nav>
            {links.map(([label, id]) => (
              <a key={id} href={"#" + id} onClick={() => menu.current?.close()}>
                {label}
              </a>
            ))}
          </nav>
          <span>Table #08</span>
        </dialog>
      </div>
    </header>
  );
}
