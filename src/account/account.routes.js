import { Router } from "express";
import { validateRequestParams } from "../middleware/validate-request-params.js";
import { body } from "express-validator";
import { isClientLogged } from "../middleware/is-logged.js";
import { updateUserById } from "../user/user.controllers.js";
import { validateJwt } from "../middleware/validate-jwt.js";
import User from "../user/user.model.js";

const router = Router();

const setParamIdFromLoggedUser = async (req, res, next) => {
  // to make compatible with the user controller
  req.params.id = req.loggedUser._id;
  next();
};

router.get("/", [validateJwt, isClientLogged], async (req, res) => {
  const id = req.loggedUser._id;
  const user = await User.findOne({ _id: id, tp_status: true }).select(
    "username email role password",
  );
  res.status(200).json({ user });
});

router.put(
  "/perfil",
  [
    validateJwt,
    isClientLogged,
    body("email", "If defined, email must be a valid email")
      .optional()
      .isEmail(),
    body("username", "If defined, username must have at least 4 characters")
      .optional()
      .isLength({ min: 4 }),
    body(
      "password",
      "If defined, must have at least 6 characters, 1 upper case, and 1 number",
    )
      .optional()
      .isStrongPassword({
        minLength: 6,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0,
      }),
    validateRequestParams,
    setParamIdFromLoggedUser,
    async (req, res, next) => {
      delete req.body.role;
      next();
    },
  ],
  updateUserById,
);

router.delete("/", [validateJwt, isClientLogged, setParamIdFromLoggedUser]);

export default router;
