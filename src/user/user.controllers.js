import User from "./user.model.js";
import bcryptjs from "bcryptjs";

export const getAllUsers = async (req, res) => {
  const { limit = 5, page = 0 } = req.query;

  const query = { tp_status: true };
  const [total, users] = await Promise.allSettled([
    User.countDocuments(query)
      .limit(parseInt(limit))
      .skip(parseInt(page) * parseInt(limit)),
    User.find(query)
      .select("username email role")
      .limit(parseInt(limit))
      .skip(parseInt(page) * parseInt(limit)),
  ]);

  res.status(200).json({
    total: total.value,
    page,
    users: users.value,
  });
};

export const createUser = async (req, res) => {
  const { username, email, password, role } = req.body;
  const salt = bcryptjs.genSaltSync();
  const encryptedPassword = bcryptjs.hashSync(password, salt);
  const user = new User({
    username,
    email,
    password: encryptedPassword,
    role,
  });
  await user.save();

  res.status(201).json({ user });
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({ _id: id, tp_status: true }).select(
    "username email role",
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({ user });
};

export const updateUserById = async (req, res) => {
  const { id } = req.params;
  const { username, email, password, role } = req.body;
  const userUpdated = { username, email, password, role };

  Object.keys(userUpdated).forEach((key) => {
    if (userUpdated[key] === undefined) {
      delete userUpdated[key];
    }
  });

  const user = await User.findOneAndUpdate(
    { _id: id, tp_status: true },
    userUpdated,
  ).select("username email role password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({
    user: { ...user._doc, ...userUpdated },
  });
};

export const deleteUserById = async (req, res) => {
  const { id } = req.params;
  const user = await User.findOneAndUpdate(
    { _id: id, tp_status: true },
    { tp_status: false },
  ).select("username email role");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({ user });
};
