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
        values: [user.name.toLowerCase(), hashPassword, user.role],
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
    const client = await pool.connect();

    try {
      const { name, password } = req.body;

      const query = {
        text: "SELECT id, password_hash, role FROM users WHERE username = $1",
        values: [name],
      };

      const result = await client.query(query);

      if (result.rows.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const user = result.rows[0];

      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = signToken({
        id: user.id,
        role: user.role,
      });

      res.status(200).json({ token });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    } finally {
      client.release();
    }
  },

  getUser: async (req: Request, res: Response) => {
    const client = await pool.connect();

    try {
      //@ts-ignore
      const userData = req.user;

      if (!userData || !userData.role || !userData.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      let queryText = "";
      let values = [userData.id];

      if (userData.role === "user") {
        queryText = "SELECT * FROM doctors WHERE user_id = $1";
      } else if (userData.role === "admin") {
        queryText = "SELECT * FROM users WHERE id = $1";
      } else {
        return res.status(403).json({ error: "Invalid role" });
      }

      const result = await client.query(queryText, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      const user = result.rows[0];
      res.status(200).json(
        userData.role === "user"
          ? {
              name: user.username,
              crm: user.crm,
              cidade: user.cidade,
              especialidade: user.especialidade,
            }
          : {
              name: user.username,
            },
      );
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal server error" });
    } finally {
      client.release();
    }
  },

  editUser: async (req: Request, res: Response) => {},
};
