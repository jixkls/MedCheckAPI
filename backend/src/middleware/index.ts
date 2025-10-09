import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";

export const userMiddleware = {
  auth: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
      }

      const token = authHeader.split(" ")[1];

      const payload = await verifyToken(token);

      if (!payload) {
        return res.status(401).json({ error: "Invalid token" });
      }
      //@ts-ignore
      req.user = payload!;

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      return res.status(401).json({ error: "Unauthorized" });
    }
  },
};
