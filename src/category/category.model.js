import { model, Schema } from "mongoose";

const Category = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  // meta data attributes
  tp_status: {
    type: Boolean,
    default: true,
  },
});

Category.index(
  { name: 1, tp_status: 1 },
  { unique: true, partialFilterExpression: { tp_status: true } },
);

export default model("Category", Category);
