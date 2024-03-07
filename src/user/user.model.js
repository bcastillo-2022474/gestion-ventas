import { model, Schema } from "mongoose";

export const [ADMIN_ROLE, CLIENT_ROLE] = ["ADMIN_ROLE", "CLIENT_ROLE"];

const User = new Schema({
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: [ADMIN_ROLE, CLIENT_ROLE],
    default: CLIENT_ROLE,
  },
  // meta data attributes
  tp_status: {
    type: Boolean,
    default: true,
  },
});

User.index(
  { email: 1, tp_status: 1 },
  { unique: true, partialFilterExpression: { tp_status: true } },
);

User.index(
  { username: 1, tp_status: 1 },
  { unique: true, partialFilterExpression: { tp_status: true } },
);

export default model("User", User);
