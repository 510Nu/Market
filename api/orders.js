import { Router } from "express";
import db from "../db/client.js";
import requireUser from "../middleware/requireUser.js";
import requireBody from "../middleware/requireBody.js";

const ordersRouter = Router();

ordersRouter.use(requireUser);

ordersRouter.get("/", async (req, res, next) => {
  try {
    const { rows: orders } = await db.query(
      `SELECT * FROM orders WHERE user_id = $1;`,
      [req.user.id],
    );
    res.send(orders);
  } catch (error) {
    next(error);
  }
});

ordersRouter.post("/", requireBody(["date"]), async (req, res, next) => {
  try {
    const { date, note } = req.body;

    const {
      rows: [order],
    } = await db.query(
      `INSERT INTO orders (date, note, user_id)
         VALUES ($1, $2, $3)
         RETURNING *;`,
      [date, note || null, req.user.id],
    );

    res.status(201).send(order);
  } catch (error) {
    next(error);
  }
});

ordersRouter.get("/:id", async (req, res, next) => {
  try {
    const {
      rows: [order],
    } = await db.query(`SELECT * FROM orders WHERE id = $1;`, [req.params.id]);

    if (!order) return res.status(404).send("Order not found.");
    if (order.user_id !== req.user.id)
      return res.status(403).send("Forbidden.");

    res.send(order);
  } catch (error) {
    next(error);
  }
});

ordersRouter.post(
  "/:id/products",
  requireBody(["productId", "quantity"]),
  async (req, res, next) => {
    try {
      const { productId, quantity } = req.body;

      const {
        rows: [order],
      } = await db.query(`SELECT * FROM orders WHERE id = $1;`, [
        req.params.id,
      ]);
      if (!order) return res.status(404).send("Order not found.");
      if (order.user_id !== req.user.id)
        return res.status(403).send("Forbidden.");

      const {
        rows: [product],
      } = await db.query(`SELECT * FROM products WHERE id = $1;`, [productId]);
      if (!product) return res.status(400).send("Product not found.");

      const {
        rows: [orderProduct],
      } = await db.query(
        `INSERT INTO orders_products (order_id, product_id, quantity)
         VALUES ($1, $2, $3)
         RETURNING *;`,
        [order.id, productId, quantity],
      );

      res.status(201).send(orderProduct);
    } catch (error) {
      next(error);
    }
  },
);

ordersRouter.get("/:id/products", async (req, res, next) => {
  try {
    const {
      rows: [order],
    } = await db.query(`SELECT * FROM orders WHERE id = $1;`, [req.params.id]);
    if (!order) return res.status(404).send("Order not found.");
    if (order.user_id !== req.user.id)
      return res.status(403).send("Forbidden.");

    const { rows: products } = await db.query(
      `SELECT p.*, op.quantity
       FROM products p
       JOIN orders_products op ON p.id = op.product_id
       WHERE op.order_id = $1;`,
      [order.id],
    );

    res.send(products);
  } catch (error) {
    next(error);
  }
});

export default ordersRouter;
