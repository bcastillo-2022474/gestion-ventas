import CartDetail from "../cart/cart_detail.model.js";
import Product from "../products/product.model.js";

export const validateStockCartDetailExistanceAndSetProduct = async (
  req,
  res,
  next,
) => {
  let { product, quantity } = req.body;
  if (!product) {
    return res.status(400).json({ message: "Product is required" });
  }

  const productFound = await Product.findOne({
    name: product,
    tp_status: true,
  });

  if (!productFound) {
    return res.status(404).json({ message: "Product not found" });
  }
  console.log({ productFound });

  const cartDetail = await CartDetail.findOne({
    cart: req.cart._id,
    product: productFound._id,
  });

  if (cartDetail) {
    quantity += cartDetail.quantity;
  }

  if (productFound.stock < quantity) {
    return res.status(400).json({ message: "Not enough stock" });
  }

  req.product = productFound;
  next();
};
