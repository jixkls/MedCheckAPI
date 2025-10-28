import "dotenv/config";
import express from "express";
import routerUser from "./router/userRoute.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use("/api", routerUser);

app.get("/db-connection", (req, res) => {
  const connectionString = `postgresql://${process.env.USER_DATABASE_DEV}:${process.env.PS_DATABASE_DEV}@${process.env.HOST_DATABASE_DEV}:${process.env.PORT_DATABASE_DEV}/${process.env.DB_DATABASE_DEV}`;
  console.log(connectionString);
});

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
