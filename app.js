import express from "express";
import getUserFromToken from "./middleware/getUserFromToken.js";
import usersRouter from "./api/users.js";
import productsRouter from "./api/products.js";
import ordersRouter from "./api/orders.js";

const app = express();

app.use(express.json());
app.use(getUserFromToken);

app.use("/users", usersRouter);
app.use("/products", productsRouter);
app.use("/orders", ordersRouter);

app.use((error, req, res, next) => {
  console.error(error);
  res
    .status(error.status || 500)
    .send(error.message || "Internal Server Error");
});

export default app;
