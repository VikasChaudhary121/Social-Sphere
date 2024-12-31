import express from "express";
import authRoute from "./routes/authRoutes.js";
import dotenv from "dotenv";
import { connectMongo } from "./db/connectMongodb.js";

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();

app.use("/api/auth", authRoute);

app.get("/", (req, res) => {
  res.send("This is home page");
});

app.listen(PORT, () => {
  console.log(`server is runnign on pORT ${PORT}`);
  connectMongo();
});
