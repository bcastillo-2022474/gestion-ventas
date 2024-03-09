import Product from "./product.model.js";
import Category from "../category/category.model.js";

export const getOutOfStockProducts = async (req, res) => {
  const { limit = 5, page = 0 } = req.query;

  const [total, products] = await Promise.allSettled([
    Product.countDocuments({ stock: 0, tp_status: true })
      .limit(limit)
      .skip(page * limit),
    Product.find({ stock: 0, tp_status: true })
      .limit(limit)
      .skip(page * limit),
  ]);

  res.status(200).json({ total: total.value, page, products: products.value });
};

export const getStatistics = async (req, res) => {
  const { limit } = req.query;
  res.status(200).json({ stats: "Stats" });
};

export const getAllProducts = async (req, res) => {
  const { limit = 5, page = 0, category } = req.query;

  const categoryFound = await Category.findOne({
    name: category,
    tp_status: true,
  });

  const query = categoryFound
    ? { tp_status: true, category: categoryFound._id }
    : { tp_status: true };

  const [total, products] = await Promise.allSettled([
    Product.countDocuments(query)
      .limit(limit)
      .skip(page * limit),
    Product.find(query)
      .select("-tp_status -__v")
      .populate("category", "name")
      .limit(limit)
      .skip(page * limit),
  ]);

  res.status(200).json({
    total: total.value,
    page,
    products: products.value,
  });
};

export const createProduct = async (req, res) => {
  const { name, description, category: categoryName, stock, price } = req.body;

  // find category
  const category = await Category.findOne({
    name: categoryName,
    tp_status: true,
  });

  if (!category) {
    return res.status(400).json({ message: "Category not found" });
  }

  const product = await new Product({
    name,
    description,
    category: category._id,
    stock,
    price,
  });
  console.log(product);

  await product.save();

  res.status(201).json({
    name,
    description,
    category: {
      name: category.name,
    },
    stock,
    price,
  });
};
export const getProduct = async (req, res) => {
  const { id } = req.params;

  const product = await Product.findOne({ _id: id, tp_status: true })
    .select("name description category stock price")
    .populate("category", "name");

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.status(200).json(product);
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, category: categoryName, stock, price } = req.body;

  const category = await Category.findOne({
    name: categoryName,
    tp_status: true,
  });

  if (!category) {
    return res.status(400).json({ message: "Category not found" });
  }

  const updatedProduct = {
    name,
    description,
    category: category._id,
    stock,
    price,
  };

  Object.keys(updatedProduct).forEach((key) => {
    if (updatedProduct[key] === undefined) {
      delete updatedProduct[key];
    }
  });

  console.log({ updatedProduct, id });

  const product = await Product.findOneAndUpdate(
    {
      _id: id,
      tp_status: true,
    },
    updatedProduct,
  ).select("-tp_status -__v");

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.status(200).json({
    ...product._doc,
    ...updatedProduct,
    category: {
      name: category.name,
    },
  });
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  const product = await Product.findOneAndUpdate(
    {
      _id: id,
      tp_status: true,
    },
    {
      tp_status: false,
    },
  )
    .select("-__v -tp_status")
    .populate("category", "name");

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.status(200).json(product);
};
