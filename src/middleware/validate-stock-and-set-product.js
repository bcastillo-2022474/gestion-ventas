import Product from "../products/product.model.js";

export const validateStockAndSetProduct = async (req, res, next) => {
  let { product, quantity } = req.body;
  const productFound = await Product.findOne({ name: product });

  if (!productFound) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (productFound.stock < quantity) {
    return res.status(400).json({ message: "Not enough stock" });
  }

  req.product = productFound;
  next();
};
