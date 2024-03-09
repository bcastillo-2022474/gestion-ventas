import { Router } from "express";
import { validateJwt } from "../middleware/validate-jwt.js";
import { isClientLogged } from "../middleware/is-logged.js";

import Cart from "../cart/cart.model.js";
import CartDetail from "../cart/cart_detail.model.js";
import Sale from "./sale.model.js";
import Product from "../products/product.model.js";

const router = Router();

router.post("/", [validateJwt, isClientLogged], async (req, res) => {
  // get cart and its details
  const { loggedUser } = req;

  const cart = await Cart.findOne({ user: loggedUser._id }).select("-__v");

  if (!cart) return res.status(404).json({ message: "Cart empty" });

  // get cart details
  const cartDetails = await CartDetail.find({ cart: cart._id })
    //  this gaves me an array, I need that for every element that has a product
    // to populate it with some fields, how??
    .populate({
      path: "product",
      select: "name price stock",
    });

  if (!cartDetails)
    return res.status(404).json({ message: "Cart details not found" });

  // merge cart details and cart in one object
  const cartData = {
    ...cart._doc,
    products: cartDetails,
  };

  // remove stock from products
  for (const product of cartData.products) {
    const { quantity, product: productData } = product;
    const newStock = productData.stock - quantity;
    const productFound = await Product.findOneAndUpdate(
      { _id: productData._id },
      { stock: newStock },
    );
    console.log({ productFound, newStock });
  }

  // create Sale
  const sale = new Sale({
    user: loggedUser._id,
    products: cartData.products,
    total_price: cartData.total_price,
  });

  await sale.save();

  const saleObj = await (
    await sale.populate("user", "username email role")
  ).populate({
    path: "products.product",
    select: "name price",
  });
  // clear cart
  await CartDetail.deleteMany({ cart: cart._id });
  await Cart.findByIdAndDelete(cart._id);

  res.status(201).json(saleObj);
});

router.get("/", [validateJwt, isClientLogged], async (req, res) => {
  const sales = await Sale.find({ user: req.loggedUser._id })
    .populate("user", "username email role")
    .select("-__v")
    .populate({
      path: "products.product",
      select: "name price",
    });
  res.status(200).json(sales);
});

export default router;
