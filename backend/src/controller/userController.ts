import { signToken, verifyToken } from "../utils/jwt";
import { Request, Response } from "express";

export const userController = {
  register: async (req: Request, res: Response) => {
    // registration logic here
    res.send("Register route");
  },

  login: async (req: Request, res: Response) => {
    // login logic here
    res.send("Login route");
  },
};
