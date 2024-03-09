import bcryptjs from "bcryptjs";
import User from "../user/user.model.js";
import { generateToken } from "../helpers/jwt.js";

export const login = async (req, res) => {
  const { username, email, password } = req.body;

  const [user] = await User.aggregate([
    {
      $match: {
        $or: [{ username }, { email }],
        tp_status: true,
      },
    },
    {
      $project: {
        uid: "$_id", // rename _id to uid
        username: "$username",
        email: "$email",
        password: "$password",
      },
    },
  ]);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!(await bcryptjs.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid password" });
  }

  console.log(user);
  const token = await generateToken(user);

  res.status(200).json({
    user,
    token,
  });
};

export const signup = async (req, res) => {
  const { username, email, password } = req.body;
  const salt = bcryptjs.genSaltSync();
  const encryptedPassword = bcryptjs.hashSync(password, salt);
  const user = new User({ username, email, password: encryptedPassword });
  await user.save();

  res.status(201).json(user);
};
