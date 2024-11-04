import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDatabase } from "./databsase/connect.js";
import indexRouter from "./routes/index.route.js";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/productImages", express.static("public/productImages"));
app.use(cookieParser());

connectDatabase()
  .then(() => {
    console.log("Connected to the Mongodb database");
    app.listen(PORT, () => {
      console.log(`Server is listening to the port : ${PORT}`);
    });
    app.on("error", (error) => {
      console.log("Not able to connect to the database");
      throw error;
    });
  })
  .catch((err) => {
    console.log("Can not connect to the MONGODB database", err);
  });

app.use(indexRouter);
