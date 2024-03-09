import { Router } from "express";
import Category from "./category.model.js";
import { body, param, query } from "express-validator";
import { validateJwt } from "../middleware/validate-jwt.js";
import { isAdminLogged } from "../middleware/is-logged.js";
import { validateRequestParams } from "../middleware/validate-request-params.js";
import {
  createCategory,
  deleteCategoryById,
  getAllCategories,
  getCategoryById,
  updateCategoryById,
} from "./category.controllers.js";

const router = Router();

router
  .route("/")
  .get(
    [
      validateJwt,
      query("limit", "Limit must be an integer").optional().isNumeric(),
      query("page", "Page must be an integer").optional().isNumeric(),
      validateRequestParams,
    ],
    getAllCategories,
  )
  .post(
    [
      validateJwt,
      isAdminLogged,
      body(
        "name",
        "Name must be defined and must have at least 4 characters",
      ).isLength({ min: 4 }),
      body("description", "Description must be a String").optional().isString(),
      body("name", "Name already in use").custom(async (name) => {
        const category = await Category.findOne({ name, tp_status: true });

        if (!category) return true;

        return Promise.reject("Name already in use");
      }),
      validateRequestParams,
    ],
    createCategory,
  );

router
  .route("/:id")
  .get(
    [
      validateJwt,
      param("id", "Id must be a valid ObjectId").isMongoId(),
      validateRequestParams,
    ],
    getCategoryById,
  )
  .put(
    [
      validateJwt,
      isAdminLogged,
      param("id", "Id must be a valid ObjectId").isMongoId(),
      body("name", "If defined, name must have at least 4 characters")
        .optional()
        .isLength({ min: 4 }),
      body("description", "If defined, description must be a String")
        .optional()
        .isString(),
      validateRequestParams,
    ],
    updateCategoryById,
  )
  .delete(
    [
      validateJwt,
      isAdminLogged,
      param("id", "Id must be a valid ObjectId").isMongoId(),
      param("id", "Category not found").custom(async (id) => {
        const category = await Category.findOne({ _id: id, tp_status: true });
        if (!category) return Promise.reject("Category not found");
      }),
      validateRequestParams,
    ],
    deleteCategoryById,
  );

export default router;
