import express from "express";
import dotenv from "dotenv";
import authRoutes from "./auth/auth.routes.js";
import morgan from "morgan";
import { dbConnection } from "./db/db-connection.js";
import productRoutes from "./products/product.routes.js";
import mongoose from "mongoose";
import categoryRoutes from "./category/category.routes.js";
import userRoutes from "./user/user.routes.js";
import cartRoutes from "./cart/cart.routes.js";

dotenv.config();

const PORT = process.env.PORT;
const app = express();

mongoose.set("debug", true);
app.use(morgan("dev"));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/user", userRoutes);
app.use("/api/cart", cartRoutes);

app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});
dbConnection().then(() => {
  console.log("Database connected");
  app.listen(PORT, () => {
    console.log(`${PORT}`);
  });
});
