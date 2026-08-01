import db from "#db/client";
import bcrypt from "bcrypt";

async function seed() {
  console.log("Digging through trash...");

  const trashProducts = [
    {
      title: "Half-Eaten Rigatoni",
      description: "Slightly moldy but you can pick out the good parts.",
      price: 1.25,
    },
    {
      title: "Single Soggy Slice Of Bread",
      description: "Wet for easy digestion.",
      price: 4.5,
    },
    {
      title: "Crushed LaCroix Can",
      description: "Pamplemousse flavor. A great accent piece.",
      price: 0.1,
    },
    {
      title: "Tangled Earbuds",
      description: "Left earbud works flawlessly.",
      price: 0.99,
    },
    {
      title: "Blockbuster Card",
      description: "Expires 04/2006. Highly collectible.",
      price: 15.0,
    },
    {
      title: "Mystery Jar of Liquid",
      description: "Apple juice or not.",
      price: 0.5,
    },
    {
      title: "Used Pizza Box",
      description: "Had pizza inside at one point",
      price: 0.25,
    },
    { title: "Broken Pencil", description: "Pointless.", price: 0.05 },
    {
      title: "Single AA Battery",
      description: "Great for remote controls.",
      price: 0.3,
    },
    {
      title: "Slightly Chewed Pen Cap",
      description: "Blue cap with natural texturing.",
      price: 0.15,
    },
  ];

  const createdProducts = [];
  for (const item of trashProducts) {
    const {
      rows: [product],
    } = await db.query(
      `INSERT INTO products (title, description, price)
       VALUES ($1, $2, $3)
       RETURNING *;`,
      [item.title, item.description, item.price],
    );
    createdProducts.push(product);
  }

  console.log("👤 Seeding user...");

  const hashedPassword = await bcrypt.hash("dumpsterdive", 10);
  const {
    rows: [user],
  } = await db.query(
    `INSERT INTO users (username, password)
     VALUES ($1, $2)
     RETURNING *;`,
    ["trash_panda", hashedPassword],
  );

  console.log("📦 Seeding order...");

  const {
    rows: [order],
  } = await db.query(
    `INSERT INTO orders (date, note, user_id)
     VALUES ($1, $2, $3)
     RETURNING *;`,
    ["2026-07-27", "Leave near the alley dumpster, please.", user.id],
  );

  const orderItems = createdProducts.slice(0, 5);
  for (const product of orderItems) {
    await db.query(
      `INSERT INTO orders_products (order_id, product_id, quantity)
       VALUES ($1, $2, $3);`,
      [order.id, product.id, 2],
    );
  }
}

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");
