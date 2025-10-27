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

      const selectUserQuery = {
        text: "SELECT id FROM users WHERE username = $1",
        values: [user.name.toLowerCase()],
      };

      const selectUser = await client.query(selectUserQuery);

      if (selectUser.rows.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }

      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashPassword = await bcrypt.hash(user.password, salt);

      const insertQuery = {
        text: "INSERT INTO users(username, password_hash, role) VALUES($1, $2, $3) RETURNING id, role",
        values: [user.name.toLowerCase(), hashPassword, user.role],
      };

      const result = await client.query(insertQuery);
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

  editUser: async (req: Request, res: Response) => {
    const client = await pool.connect();

    try {
      //@ts-ignore
      const userData = req.user;

      if (!userData || !userData.id || !userData.role) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const { name, cidade, especialidade } = req.body;

      let queryText = "";
      let values: any[] = [];

      if (userData.role === "user") {
        queryText = `
        UPDATE doctor
        SET name = $1,
            cidade = $2,
            especialidade = $2
        WHERE id = $5
        RETURNING username, crm, cidade, especialidade
      `;
        values = [name, cidade, especialidade, userData.id];
      } else if (userData.role === "admin") {
        queryText = `
        UPDATE users
        SET username = $1
        WHERE id = $2
        RETURNING username
      `;
        values = [name, userData.id];
      } else {
        return res.status(403).json({ error: "Invalid role" });
      }

      const result = await client.query(queryText, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found or not updated" });
      }

      const updatedUser = result.rows[0];

      res.status(200).json(
        userData.role === "user"
          ? {
              name: updatedUser.name,
              crm: updatedUser.crm,
              cidade: updatedUser.cidade,
              especialidade: updatedUser.especialidade,
            }
          : {
              name: updatedUser.username,
            },
      );
    } catch (error) {
      console.error("Error editing user:", error);
      res.status(500).json({ error: "Internal server error" });
    } finally {
      client.release();
    }
  },

  registerDoctor: async (req: Request, res: Response) => {
    const client = await pool.connect();

    try {
      //@ts-ignore
      const userData = req.user;

      if (!userData || userData.role !== "admin") {
        return res.status(403).json({ error: "Access denied. Admins only." });
      }

      const { username, name, password, crm, cidade, especialidade } = req.body;

      if (
        !username ||
        !name ||
        !password ||
        !crm ||
        !cidade ||
        !especialidade
      ) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await client.query("BEGIN");

      const userSelectQuery = {
        text: `SELECT id FROM users WHERE username = $1`,
        values: [username.toLowerCase()],
      };

      const existUser = await client.query(userSelectQuery);

      if (existUser.rows.length > 0) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const crmCheckQuery = {
        text: `SELECT id FROM doctors WHERE crm = $1`,
        values: [crm],
      };

      const existCRM = await client.query(crmCheckQuery);

      if (existCRM.rows.length > 0) {
        return res.status(400).json({ message: "CRM already exists" });
      }

      const userInsertQuery = {
        text: `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, 'user') RETURNING id, username`,
        values: [username.toLowerCase(), hashedPassword],
      };

      const userResult = await client.query(userInsertQuery);
      const newUser = userResult.rows[0];

      const doctorInsertQuery = {
        text: `INSERT INTO doctors (user_id, name, cidade, crm, especialidade) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        values: [newUser.id, name.toLowerCase(), cidade, crm, especialidade],
      };

      await client.query(doctorInsertQuery);

      await client.query("COMMIT");

      res.status(201).json({
        message: "Doctor registered successfully",
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error registering doctor:", error);
      res.status(500).json({ error: "Internal server error" });
    } finally {
      client.release();
    }
  },

  editDoctor: async (req: Request, res: Response) => {
    const client = await pool.connect();
    const idDoctor = req.params.id;
    //@ts-ignore
    const userData = req.user;
    try {
      if (userData.role !== "admin") {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { name, cidade, especialidade } = req.body;

      console.log(idDoctor);
      const updateQuery = {
        text: "UPDATE doctors SET name = $1, cidade = $2, especialidade = $3 WHERE crm = $4 RETURNING *",
        values: [name, cidade, especialidade, idDoctor],
      };

      const result = await client.query(updateQuery);

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Doctor not found" });
      }

      const updatedDoctor = result.rows[0];

      res.status(200).json({
        nome: updatedDoctor.name,
        crm: updatedDoctor.crm,
        cidade: updatedDoctor.cidade,
        especialidade: updatedDoctor.especialidade,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    } finally {
      client.release();
    }
  },

  deleteDoctor: async (req: Request, res: Response) => {
    const client = await pool.connect();
    //@ts-ignore
    const userData = req.user;
    try {
      if (userData.role !== "admin") {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { id } = req.params;

      const doctorResult = await client.query(
        "SELECT * FROM doctors WHERE crm = $1",
        [id],
      );
      if (doctorResult.rowCount === 0) {
        return res.status(404).json({ message: "Doctor not found" });
      }

      await client.query("DELETE FROM doctors WHERE crm = $1", [id]);

      return res.status(200).json({ message: "Doctor deleted successfully" });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    } finally {
      client.release();
    }
  },
  getDoctors: async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT crm, name, especialidade, cidade FROM doctors ORDER BY name ASC",
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "No doctors found" });
      }

      return res.status(200).json(result.rows);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    } finally {
      client.release();
    }
  },
  getDoctorsById: async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
      const { id } = req.params;
      const cleanedId = id.trim();

      const result = await client.query(
        "SELECT crm, name, especialidade, cidade FROM doctors WHERE crm = $1",
        [id],
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Doctor not found" });
      }

      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    } finally {
      client.release();
    }
  },
  getSpecialists: async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT DISTINCT especialidade FROM doctors ORDER BY especialidade ASC",
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "No specialists found" });
      }

      return res.status(200).json(result.rows);
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    } finally {
      client.release();
    }
  },
  searchDoctors: async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
      const { specialty, city, name } = req.query;
  
      let baseQuery = `
        SELECT crm, name, especialidade, cidade
        FROM doctors
        WHERE 1=1
      `;
      const values: any[] = [];
  
      if (specialty) {
        values.push(`%${specialty}%`);
        baseQuery += ` AND especialidade ILIKE $${values.length}`;
      }
  
      if (city) {
        values.push(`%${city}%`);
        baseQuery += ` AND cidade ILIKE $${values.length}`;
      }
  
      if (name) {
        values.push(`%${name}%`);
        baseQuery += ` AND name ILIKE $${values.length}`;
      }
  
      baseQuery += ` ORDER BY name ASC`;
  
      const result = await client.query(baseQuery, values);
  
      if (result.rowCount === 0) {
        return res.status(404).json({ message: "No doctors found" });
      }
  
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    } finally {
      client.release();
    }
  },
};
