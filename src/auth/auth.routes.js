import Router from "express";
import { body } from "express-validator";
import { validateRequestParams } from "../middleware/validate-request-params.js";
import { login, signup } from "./auth.controller.js";
import { isEmailAndUsernameUnique } from "../middleware/is-email-and-username-unique.js";

const router = Router();

router.post(
  "/login",
  [
    body("email", "Email when declared, must be a valid email")
      .optional()
      .isEmail(),
    body("username", "Username, when declared, must have at least 3 characters")
      .optional()
      .isLength({ min: 3 }),
    body("password", "Password must have at least 6 characters").isLength({
      min: 6,
    }),
    // check that either email or username is provided
    body("", "Username or Email is required").custom(({ username, email }) => {
      return Boolean(username || email);
    }),
    validateRequestParams,
  ],
  login,
);

router.post(
  "/signup",
  [
    body("email", "Must be a valid Email").isEmail(),
    body("username", "Must have more than 3 characters").isLength({ min: 4 }),
    body(
      "password",
      "Must have at least 6 characters, 1 upper case, and 1 number",
    ).isStrongPassword({
      minLength: 6,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    }),
    body("").custom(isEmailAndUsernameUnique),
    validateRequestParams,
  ],
  signup,
);

export default router;
