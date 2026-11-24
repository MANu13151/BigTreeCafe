export const categories = [
  "Chef's Signatures",
  "Wood-Fired Pizzas",
  "Mezze & Small Plates",
  "Artisan Pastas & Mains",
  "Smoked Cocktails & Coolers",
  "Desserts",
] as const;
export type Dish = {
  id: string;
  name: string;
  description: string;
  price: number;
  veg: boolean;
  category: number;
  photo: string;
  signature?: boolean;
  bestseller?: boolean;
};
export const dishes: Dish[] = [
  {
    id: "margherita",
    name: "Basil Margherita",
    description:
      "San Marzano tomato, fresh mozzarella and basil on a blistered sourdough crust.",
    price: 495,
    veg: true,
    category: 1,
    photo: "pizza",
    signature: true,
    bestseller: true,
  },
  {
    id: "garden",
    name: "Lagoon Garden Bowl",
    description:
      "Seasonal greens, crisp vegetables and a lemon-tahini dressing.",
    price: 385,
    veg: true,
    category: 2,
    photo: "mezze",
    signature: true,
  },
  {
    id: "chicken",
    name: "Flame-Grilled Chicken",
    description:
      "Herb-marinated chicken, seared over an open flame with roast vegetables.",
    price: 595,
    veg: false,
    category: 3,
    photo: "chicken",
    signature: true,
    bestseller: true,
  },
  {
    id: "pesto",
    name: "Basil Pesto Pasta",
    description:
      "Hand-tossed pasta, sweet cherry tomatoes and fragrant basil pesto.",
    price: 465,
    veg: true,
    category: 3,
    photo: "pasta",
    signature: true,
  },
  {
    id: "pepperoni",
    name: "Wood-Fired Pepperoni",
    description:
      "Smoked pepperoni, melted mozzarella and our slow-cooked tomato sauce.",
    price: 575,
    veg: false,
    category: 1,
    photo: "pepperoni",
  },
  {
    id: "spaghetti",
    name: "Spaghetti al Pomodoro",
    description:
      "Spaghetti folded through slow-simmered tomato sauce and fresh herbs.",
    price: 445,
    veg: true,
    category: 3,
    photo: "spaghetti",
  },
  {
    id: "rosemary",
    name: "Rosemary Smoke",
    description:
      "A citrus-forward signature cocktail finished under a veil of rosemary smoke.",
    price: 625,
    veg: true,
    category: 4,
    photo: "/images/cocktail-smoke.jpg",
    bestseller: true,
  },
  {
    id: "cooler",
    name: "Lagoon Citrus Cooler",
    description:
      "Fresh lime, orange and a splash of sparkling water, served over crushed ice.",
    price: 275,
    veg: true,
    category: 4,
    photo: "cooler",
  },
  {
    id: "brownie",
    name: "Dark Chocolate Brownie",
    description:
      "Rich dark chocolate with a soft centre and a delicate crackled top.",
    price: 325,
    veg: false,
    category: 5,
    photo: "chocolate",
  },
];
export type Cart = Record<string, number>;
export const currency = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
export const itemsFor = (cart: Cart) =>
  dishes
    .filter((d) => cart[d.id] > 0)
    .map((d) => ({ ...d, quantity: cart[d.id] }));
export const totalFor = (cart: Cart) => {
  const items = itemsFor(cart);
  const subtotal = items.reduce((n, d) => n + d.price * d.quantity, 0);
  const gst = Math.round(subtotal * 5) / 100;
  return {
    subtotal,
    gst,
    total: subtotal + gst,
    count: items.reduce((n, d) => n + d.quantity, 0),
  };
};
export const whatsapp = (message: string) =>
  "https://wa.me/" +
  (process.env.NEXT_PUBLIC_CAFE_WHATSAPP || "918183959595") +
  "?text=" +
  encodeURIComponent(message);
