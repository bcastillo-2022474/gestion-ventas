import { model, Schema } from "mongoose";

const CartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  total_price: {
    type: Number,
    default: 0,
  },
  last_updated: {
    type: Date,
    default: Date.now,
  },
});

export default model("Cart", CartSchema);
