import Cart from "../cart/cart.model.js";

export const findOrCreateUserCart = async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.loggedUser._id });
  if (!cart) {
    cart = new Cart({ user: req.loggedUser._id });
    await cart.save();
  }
  req.cart = cart;
  next();
};
