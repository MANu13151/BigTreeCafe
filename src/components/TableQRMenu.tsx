"use client";
import { useState } from "react";
import {
  ChefHat,
  Search,
  Plus,
  Minus,
  Leaf,
  Star,
  X,
  Pizza,
  Salad,
  Utensils,
  Martini,
  CakeSlice,
} from "lucide-react";
import { categories, dishes, currency, type Dish, type Cart } from "@/lib/menu";
export function Stepper({
  dish,
  quantity,
  adjust,
}: {
  dish: Dish;
  quantity: number;
  adjust: (id: string, n: number) => void;
}) {
  return quantity ? (
    <div className="stepper">
      <button
        aria-label={"Remove one " + dish.name}
        onClick={() => adjust(dish.id, -1)}
      >
        <Minus size={14} />
      </button>
      <span aria-live="polite">{quantity}</span>
      <button
        disabled={quantity >= 99}
        aria-label={"Add one " + dish.name}
        onClick={() => adjust(dish.id, 1)}
      >
        <Plus size={14} />
      </button>
    </div>
  ) : (
    <button
      className="add-button"
      aria-label={"Add " + dish.name}
      onClick={() => adjust(dish.id, 1)}
    >
      <Plus size={15} />
      Add
    </button>
  );
}
const icons = [ChefHat, Pizza, Salad, Utensils, Martini, CakeSlice];
export default function TableQRMenu({
  cart,
  adjust,
  initialCategory,
}: {
  initialCategory: number;
  cart: Cart;
  adjust: (id: string, n: number) => void;
}) {
  const [category, setCategory] = useState(initialCategory),
    [veg, setVeg] = useState(false),
    [query, setQuery] = useState("");
  const search = query.trim().toLowerCase();
  const result = dishes.filter(
    (d) =>
      (search
        ? (d.name + " " + d.description).toLowerCase().includes(search)
        : category === 0
          ? d.signature
          : d.category === category) &&
      (!veg || d.veg),
  );
  return (
    <section id="menu" className="menu-section">
      <div className="shell">
        <div className="menu-controls">
          <div className="menu-intro">
            <div>
              <p className="eyebrow terra">
                <span />À la carte
              </p>
              <h2>
                The Table <em>Menu</em>
              </h2>
            </div>
            <div className="menu-tools">
              <label className="search">
                <Search size={16} />
                <input
                  aria-label="Search all dishes"
                  type="search"
                  placeholder="Search dishes..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <button
                className="veg-switch"
                role="switch"
                aria-checked={veg}
                onClick={() => setVeg(!veg)}
              >
                <Leaf size={16} />
                Veg Only
                <i />
              </button>
            </div>
          </div>
          <div className="filter-sticky">
            <div className="filters" aria-label="Menu categories">
              {categories.map((c, i) => {
                const Icon = icons[i];
                return (
                  <button
                    key={c}
                    aria-pressed={!search && category === i}
                    onClick={() => {
                      setCategory(i);
                      setQuery("");
                    }}
                  >
                    <Icon size={16} />
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="dish-grid">
          {result.map((d) => (
            <article key={d.id} className="dish-card">
              <div className="dish-picture aspect-[16/10]">
                <img
                  src={
                    d.photo.startsWith("/")
                      ? d.photo
                      : "/images/menu/" + d.photo + ".jpg"
                  }
                  loading="lazy"
                  alt={d.name}
                />
                {d.bestseller && (
                  <span className="best">
                    <Star size={11} fill="currentColor" />
                    Bestseller
                  </span>
                )}
              </div>
              <div className="dish-info">
                <span className={"diet " + (d.veg ? "" : "nonveg")}>
                  <i />
                  {d.veg ? "Veg" : "Non-Veg"}
                </span>
                <h3>{d.name}</h3>
                <p>{d.description}</p>
                <div className="dish-bottom">
                  <strong>{currency(d.price)}</strong>
                  <Stepper
                    dish={d}
                    quantity={cart[d.id] || 0}
                    adjust={adjust}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
        {result.length === 0 && (
          <div className="empty-results">
            <Search />
            <h3>No dishes found</h3>
            <button
              onClick={() => {
                setQuery("");
                setVeg(false);
                setCategory(0);
              }}
            >
              <X size={14} />
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
