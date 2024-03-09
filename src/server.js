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
import saleRoutes from "./sale/sale.routes.js";
import accountRoutes from "./account/account.routes.js";
import User, { ADMIN_ROLE } from "./user/user.model.js";
import Category from "./category/category.model.js";
import invoiceRoutes from "./invoice/invoice.routes.js";

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
app.use("/api/buy", saleRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});
dbConnection()
  .then(() => {
    console.log("Database connected");

    // create ADMIN DEFAULT USER
    // create DEFAULT_CATEGORY
    const fun = async () => {
      const adminUser = await User.findOne({
        tp_status: true,
        role: ADMIN_ROLE,
      });
      if (!adminUser) {
        const admin = new User({
          username: "admin_21",
          email: "admin21@email.com",
          password: "Admin21",
          role: ADMIN_ROLE,
        });

        await admin.save();
      }

      const defaultCategoryFound = await Category.findOne({ name: "Default" });
      if (!defaultCategoryFound) {
        const defaultCategory = new Category({
          name: "Default",
        });
        await defaultCategory.save();
      }
    };
    return fun();
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`${PORT}`);
    });
  });
