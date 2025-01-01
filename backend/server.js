import express from "express";
import authRoute from "./routes/authRoutes.js";
import dotenv from "dotenv";
import { connectMongo } from "./db/connectMongodb.js";
import cookieParser from "cookie-parser";

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoute);

app.get("/", (req, res) => {
  res.send("This is home page");
});

app.listen(PORT, () => {
  console.log(`server is runnign on pORT ${PORT}`);
  connectMongo();
});
