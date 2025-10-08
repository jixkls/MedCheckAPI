import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import express from "express";

console.log("USER_DATABASE_DEV:", process.env.USER_DATABASE_DEV);
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
