import jwt from "jsonwebtoken";
import User from "../user/user.model.js";

export const validateJwt = async (req, res, next) => {
  const token = req.header("x-token");

  if (!token) {
    return res.status(401).json({ message: "Token is required" });
  }

  try {
    const { uid } = jwt.verify(token, process.env.SECRET_PRIVATE_KEY);
    const user = await User.findOne({ _id: uid, tp_status: true });
    console.log({ uid, user });

    if (!user) {
      return res
        .status(401)
        .json({ message: "User not found, this user might be deleted" });
    }

    req.loggedUser = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Invalid token or token expired" });
  }
};
