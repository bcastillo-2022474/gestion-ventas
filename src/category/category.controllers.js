import Category from "./category.model.js";
import Product from "../products/product.model.js";

export const getAllCategories = async (req, res) => {
  const { limit = 5, page = 0 } = req.query;

  const query = { tp_status: true };
  const [total, categories] = await Promise.allSettled([
    Category.countDocuments(query)
      .limit(limit)
      .skip(limit * page),
    Category.find(query)
      .select("-tp_status -__v")
      .limit(limit)
      .skip(limit * page),
  ]);

  res.status(200).json({ total: total.value, categories: categories.value });
};

export const createCategory = async (req, res) => {
  const { name, description = "" } = req.body;
  const category = new Category({ name, description });
  await category.save();
  res.status(201).json({ name, _id: category._id, description });
};
export const getCategoryById = async (req, res) => {
  const { id } = req.params;
  const category = await Category.findOne({
    _id: id,
    tp_status: true,
  }).select("-tp_status -__v");

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  res.status(200).json(category);
};

export const updateCategoryById = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const updatedCategory = { name, description };

  Object.keys(updatedCategory).forEach((key) => {
    if (updatedCategory[key] === undefined) {
      delete updatedCategory[key];
    }
  });

  const category = await Category.findOneAndUpdate(
    {
      _id: id,
      tp_status: true,
    },
    updatedCategory,
  ).select("-tp_status -__v");

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  res.status(200).json({ ...category._doc, ...updatedCategory });
};
export const deleteCategoryById = async (req, res) => {
  const { id } = req.params;

  let DEFAULT_CATEGORY = await Category.findOne({
    name: "Default",
    tp_status: true,
  });

  if (!DEFAULT_CATEGORY) {
    // create the default category
    DEFAULT_CATEGORY = new Category({
      name: "Default",
    });
    await DEFAULT_CATEGORY.save();
  }

  await Product.findOneAndUpdate(
    {
      category: id,
      tp_status: true,
    },
    { category: DEFAULT_CATEGORY._id },
  );

  const category = await Category.findOneAndUpdate(
    {
      _id: id,
      tp_status: true,
    },
    { tp_status: false },
  ).select("-tp_status -__v");

  res.status(200).json(category);
};
