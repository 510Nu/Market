import { Router } from "express";
import db from "../db/client.js";

const productsRouter = Router();

// GET /products - Get all products
productsRouter.get("/", async (req, res, next) => {
  try {
    const { rows: products } = await db.query("SELECT * FROM products;");
    res.send(products);
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/:id/orders", async (req, res, next) => {
  try {
    const { id } = req.params;

    const {
      rows: [product],
    } = await db.query(`SELECT * FROM products WHERE id = $1;`, [id]);

    if (!product) {
      return res.status(404).send("Product not found.");
    }

    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }

    const { rows: orders } = await db.query(
      `SELECT o.* 
       FROM orders o
       JOIN orders_products op ON o.id = op.order_id
       WHERE op.product_id = $1 AND o.user_id = $2;`,
      [id, req.user.id],
    );

    res.send(orders);
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      rows: [product],
    } = await db.query("SELECT * FROM products WHERE id = $1;", [id]);

    if (!product) {
      return res.status(404).send("Product not found.");
    }

    res.send(product);
  } catch (error) {
    next(error);
  }
});

export default productsRouter;
