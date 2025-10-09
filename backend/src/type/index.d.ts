declare global {
  namespace Express {
    interface Request {
      user?: object; // ou use 'any' se preferir
    }
  }
}
