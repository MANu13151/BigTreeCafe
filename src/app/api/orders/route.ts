import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { dishes, itemsFor, totalFor, type Cart } from "@/lib/menu";
export const runtime = "nodejs";
export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid order." }, { status: 400 });
  }
  if (
    !body ||
    typeof body.id !== "string" ||
    !/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(
      body.id,
    ) ||
    !body.cart ||
    typeof body.cart !== "object" ||
    Array.isArray(body.cart) ||
    typeof body.notes !== "string" ||
    body.notes.length > 500
  )
    return Response.json({ error: "Invalid order." }, { status: 400 });
  const cart: Cart = body.cart;
  if (
    !Object.keys(cart).length ||
    Object.entries(cart).some(
      ([id, q]) =>
        !dishes.some((d) => d.id === id) ||
        !Number.isInteger(q) ||
        q < 1 ||
        q > 99,
    )
  )
    return Response.json(
      { error: "Check your tray and try again." },
      { status: 400 },
    );
  const ticket = JSON.stringify({
    table: "08",
    items: itemsFor(cart).map(({ id, name, price, quantity }) => ({
      id,
      name,
      price,
      quantity,
    })),
    ...totalFor(cart),
    notes: body.notes,
  });
  const dir = join(process.cwd(), ".data");
  mkdirSync(dir, { recursive: true });
  const db = new DatabaseSync(join(dir, "orders.sqlite"));
  try {
    db.exec(
      "PRAGMA busy_timeout=3000; CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, ticket TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP)",
    );
    db.prepare("INSERT OR IGNORE INTO orders (id,ticket) VALUES (?,?)").run(
      body.id,
      ticket,
    );
    if (
      db.prepare("SELECT ticket FROM orders WHERE id=?").get(body.id)
        ?.ticket !== ticket
    )
      return Response.json(
        { error: "This order reference is already in use." },
        { status: 409 },
      );
    return Response.json({ reference: body.id.slice(0, 8).toUpperCase() });
  } finally {
    db.close();
  }
}
