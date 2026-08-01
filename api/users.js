import { Router } from "express";
import bcrypt from "bcrypt";
import db from "../db/client.js";
import requireBody from "../middleware/requireBody.js";
import { signToken } from "../utils/jwt.js";
const usersRouter = Router();

usersRouter.post(
  "/register",
  requireBody(["username", "password"]),
  async (req, res, next) => {
    try {
      const { username, password } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);

      const {
        rows: [user],
      } = await db.query(
        `INSERT INTO users (username, password)
         VALUES ($1, $2)
         RETURNING id, username;`,
        [username, hashedPassword],
      );

      const token = signToken({ id: user.id, username: user.username });

      res.status(201).send(token);
    } catch (error) {
      next(error);
    }
  },
);

usersRouter.post(
  "/login",
  requireBody(["username", "password"]),
  async (req, res, next) => {
    try {
      const { username, password } = req.body;

      const {
        rows: [user],
      } = await db.query(`SELECT * FROM users WHERE username = $1;`, [
        username,
      ]);

      if (!user) {
        return res.status(401).send("Invalid credentials.");
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).send("Invalid credentials.");
      }

      const token = signToken({ id: user.id, username: user.username });

      res.send(token);
    } catch (error) {
      next(error);
    }
  },
);

export default usersRouter;
