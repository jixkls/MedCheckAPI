import { signToken, verifyToken } from "../utils/jwt.js";
import { Request, Response } from "express";
import pool from "../db.js";
import * as bcrypt from "bcrypt";
import { sign } from "crypto";

export const userController = {
  register: async (req: Request, res: Response) => {
    const client = await pool.connect();

    try {
      const user = req.body;

      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashPassword = await bcrypt.hash(user.password, salt); // assuming plaintext password

      const query = {
        text: "INSERT INTO users(username, password_hash, role) VALUES($1, $2, $3) RETURNING id, role",
        values: [user.name, hashPassword, user.role],
      };

      const result = await client.query(query);
      const newUser = result.rows[0];

      const token = signToken({
        id: newUser.id,
        role: newUser.role,
      });

      res.status(200).json({ token });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    } finally {
      client.release();
    }
  },
  login: async (req: Request, res: Response) => {
    // login logic here
    res.send("Login route");
  },
};
