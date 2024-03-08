import { Router } from "express";
import { validateJwt } from "../middleware/validate-jwt.js";
import { body } from "express-validator";
import { validateRequestParams } from "../middleware/validate-request-params.js";
import CartDetailSchema from "./cart_detail.model.js";
import Cart from "./cart.model.js";
import { isClientLogged } from "../middleware/is-logged.js";
import { findOrCreateUserCart } from "../middleware/find-or-create-user-cart.js";
import { validateStockCartDetailExistanceAndSetProduct } from "../middleware/validate-stock-cart-detail-existance-and-set-product.js";
import { validateStockAndSetProduct } from "../middleware/validate-stock-and-set-product.js";
import Product from "../products/product.model.js";

const middlewares = [
  validateJwt,
  isClientLogged,
  body("quantity").isInt({ min: 1 }),
  validateRequestParams,
  findOrCreateUserCart,
];

const router = Router();

router.post(
  "/add",
  [...middlewares, validateStockCartDetailExistanceAndSetProduct],
  async (req, res) => {
    const { quantity } = req.body;
    const productFound = req.product;
    const cart = req.cart;

    const cartDetailFound = await CartDetailSchema.findOneAndUpdate(
      { cart, product: productFound._id },
      {
        // increment the price and the quantity of the product
        $inc: { price: productFound.price * quantity, quantity },
      },
    ).select("product quantity price");

    let addedProduct;
    if (!cartDetailFound) {
      const cartDetail = new CartDetailSchema({
        cart: cart._id,
        product: productFound._id,
        quantity,
        price: productFound.price * quantity,
      });

      await cartDetail.save();

      addedProduct = { product: cartDetail };
    } else {
      addedProduct = {
        product: {
          ...cartDetailFound._doc,
          price: cartDetailFound.price + productFound.price * quantity,
          quantity: cartDetailFound.quantity + quantity,
        },
      };
    }

    console.log({ addedProduct, cartDetailFound });
    await Cart.findByIdAndUpdate(cart._id, {
      $inc: {
        total_price: addedProduct.product.price,
      },
      last_updated: Date.now(),
    });

    res.status(201).json(addedProduct);
  },
);

router.put(
  "/update",
  [...middlewares, validateStockAndSetProduct],
  async (req, res) => {
    const { quantity } = req.body;
    const productFound = req.product;
    const cart = req.cart;

    console.log({ quantity });
    const cartDetailFound = await CartDetailSchema.findOneAndUpdate(
      { cart, product: productFound._id },
      {
        // increment the price and the quantity of the product
        price: productFound.price * quantity,
        quantity,
      },
    ).select("product quantity price");

    let addedProduct;

    if (!cartDetailFound) {
      const cartDetail = new CartDetailSchema({
        cart: cart._id,
        product: productFound._id,
        quantity,
        price: productFound.price * quantity,
      });

      await cartDetail.save();

      addedProduct = { product: cartDetail };
    } else {
      addedProduct = {
        product: {
          ...cartDetailFound._doc,
          price: productFound.price * quantity,
          quantity: quantity,
        },
      };
    }

    console.log({ addedProduct, cartDetailFound });
    await Cart.findByIdAndUpdate(cart._id, {
      $inc: {
        total_price: addedProduct.product.price - (cartDetailFound?.price ?? 0),
      },
      last_updated: Date.now(),
    });

    res.status(201).json(addedProduct);
  },
);

router.delete("/delete", [validateJwt, isClientLogged], async (req, res) => {
  const id = req.loggedUser._id;
  const cart = await Cart.findOne({ user: id });
  if (!cart) {
    return res.status(404).json({ message: "Cart doesnt exist" });
  }
  await CartDetailSchema.deleteMany({ cart: cart._id });
  await Cart.deleteOne({ user: id });
  res.status(200).json({ message: "Cart deleted" });
});

router.delete(
  "/delete/item",
  [validateJwt, isClientLogged],
  async (req, res) => {
    const { product } = req.body;

    const productFound = await Product.findOne({ name: product });

    if (!productFound) {
      return res.status(404).json({ message: "Product not found" });
    }

    const cart = await Cart.findOne({ user: req.loggedUser._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const deleted = await CartDetailSchema.findOneAndDelete({
      cart: cart._id,
      product: productFound._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Product not found in the cart" });
    }

    console.log({ deleted });
    await Cart.findByIdAndUpdate(cart._id, {
      $inc: { total_price: -deleted.price },
      last_updated: Date.now(),
    });

    res.status(200).json({ message: "Product removed from the cart" });
  },
);

router.get("/", [validateJwt, isClientLogged], async (req, res) => {
  const id = req.loggedUser._id;
  const cart = await Cart.findOne({ user: id })
    .select("-__v")
    .populate("user", "username email role");
  if (!cart) {
    //   create cart
    const newCart = new Cart({ user: id });
    await newCart.save();
    return res.status(200).json({ cart: newCart });
  }

  // get cart details and populate fields
  const cartDetails = await CartDetailSchema.find({ cart: cart._id })
    .select("-__v")
    .populate("product", "name price");

  console.log({ cartDetails });

  res.status(200).json({ cart: { ...cart._doc, details: cartDetails } });
});

export default router;
