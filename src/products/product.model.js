import { model, Schema } from "mongoose";

const Product = new Schema({
  name: {
    required: true,
    type: String,
  },
  description: String,
  category: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Category",
  },
  stock: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  // meta data attributes
  tp_status: {
    type: Boolean,
    default: true,
  },
});

// Indexes, to make soft delete work
Product.index(
  { name: 1, tp_status: 1 },
  {
    unique: true,
    partialFilterExpression: { tp_status: true },
  },
);

Product.on("index", function (error) {
  // This will log any indexing errors
  console.log(error);
});

export default model("Product", Product);
