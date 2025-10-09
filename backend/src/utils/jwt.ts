// utils/jwt.ts
import jwt, { SignOptions, JwtPayload, Secret } from "jsonwebtoken";

const SECRET: Secret = process.env.JWT_SECRET || "default-secret";

export const signToken = (
  payload: string | object | Buffer,
  expiresIn: number = 3600,
): string => {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, SECRET, options);
};

export const verifyToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, SECRET);

  if (typeof decoded === "string") {
    throw new Error("Invalid token payload: expected an object");
  }

  return decoded;
};
