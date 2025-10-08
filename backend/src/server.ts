import "dotenv/config";
import express from "express";
import routerUser from "./router/userRoute.js";

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

app.use("/api", routerUser);

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
