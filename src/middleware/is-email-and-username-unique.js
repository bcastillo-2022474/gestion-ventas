import User from "../user/user.model.js";

export const isEmailAndUsernameUnique = async ({ username, email }) => {
  const foundUser = await User.findOne({
    $or: [{ username }, { email }],
    tp_status: true,
  });
  if (!foundUser) return;

  if (foundUser.email === email && foundUser.username === username) {
    throw new Error("This user already exists, try login in");
  }

  if (foundUser.username === username) {
    throw new Error("Username already exists");
  }

  if (foundUser.email === email) {
    throw new Error("Email already exists");
  }
};
