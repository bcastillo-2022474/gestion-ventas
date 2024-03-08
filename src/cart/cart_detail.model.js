import { model, Schema } from "mongoose";

const CartDetailSchema = new Schema({
  cart: {
    type: Schema.Types.ObjectId,
    ref: "Cart",
    required: true,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
  },
});

export default model("CartDetail", CartDetailSchema);
