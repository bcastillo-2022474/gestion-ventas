import { Router } from "express";
import { ADMIN_ROLE, CLIENT_ROLE } from "./user.model.js";
import { validateJwt } from "../middleware/validate-jwt.js";
import { isAdminLogged } from "../middleware/is-logged.js";
import { body, param, query } from "express-validator";
import { validateRequestParams } from "../middleware/validate-request-params.js";
import { isEmailAndUsernameUnique } from "../middleware/is-email-and-username-unique.js";
import {
  createUser,
  deleteUserById,
  getAllUsers,
  getUserById,
  updateUserById,
} from "./user.controllers.js";

const router = Router();

router
  .route("/")
  .get(
    [
      validateJwt,
      isAdminLogged,
      query("limit", "Limit must be an integer").optional().isNumeric(),
      query("page", "Page must be an integer").optional().isNumeric(),
      validateRequestParams,
    ],
    getAllUsers,
  )
  .post(
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
      body(
        "role",
        `Role must be defined, must be either ${CLIENT_ROLE} or ${ADMIN_ROLE}`,
      ).isIn([ADMIN_ROLE, CLIENT_ROLE]),
      body("").custom(isEmailAndUsernameUnique),
      validateRequestParams,
    ],
    createUser,
  );

router
  .route("/:id")
  .get(
    [
      validateJwt,
      isAdminLogged,
      param("id", "Id must be a valid ObjectId").isMongoId(),
      validateRequestParams,
    ],
    getUserById,
  )
  .put(
    [
      validateJwt,
      isAdminLogged,
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
      body(
        "role",
        `If defined, role must be defined, must be either ${CLIENT_ROLE} or ${ADMIN_ROLE}`,
      )
        .optional()
        .isIn([ADMIN_ROLE, CLIENT_ROLE]),
      validateRequestParams,
    ],
    updateUserById,
  )
  .delete(
    [
      validateJwt,
      isAdminLogged,
      param("id", "Id must be a valid ObjectId").isMongoId(),
      validateRequestParams,
    ],
    deleteUserById,
  );

export default router;
