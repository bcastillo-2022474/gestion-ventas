import { Router } from "express";
import Product from "./product.model.js";
import { body, param, query } from "express-validator";
import { validateRequestParams } from "../middleware/validate-request-params.js";
import { validateJwt } from "../middleware/validate-jwt.js";
import { isAdminLogged } from "../middleware/is-logged.js";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getOutOfStockProducts,
  getProduct,
  getStatistics,
  updateProduct,
} from "./product.controllers.js";

const router = Router();

router.get(
  "/stats",
  [
    validateJwt,
    isAdminLogged,
    query("limit", "Limit must be an integer").optional().isNumeric(),
    validateRequestParams,
  ],
  getStatistics,
);

// agotados
router.get(
  "/out-of-stock",
  [
    validateJwt,
    isAdminLogged,
    query("limit", "Limit must be an integer").optional().isNumeric(),
    query("page", "Page must be an integer").optional().isNumeric(),
    validateRequestParams,
  ],
  getOutOfStockProducts,
);

router
  .route("/")
  .get(
    [
      validateJwt,
      query("limit", "Limit must be an integer").optional().isNumeric(),
      query("page", "Page must be an integer").optional().isNumeric(),
      query("category", "Category must be a string").optional().isString(),
      validateRequestParams,
    ],
    getAllProducts,
  )
  .post(
    [
      validateJwt,
      isAdminLogged,
      body("name", "Name must be defined and must have at least 4 characters")
        .isString()
        .notEmpty()
        .isLength({ min: 4 }),

      body("name", "Name already in use").custom(async (name) => {
        const product = await Product.findOne({ name, tp_status: true });

        if (!product) return true;

        throw new Error("Name already in use");
      }),

      body(
        "description",
        "Description must be defined and must have at least 10 characters and less than 200",
      )
        .isString()
        .notEmpty()
        .isLength({ max: 200, min: 10 }),
      body("category").isString().notEmpty(),
      body("stock", "Stock must be defined and be an integer").isInt(),
      body("price", "Price must be defined and be a number").isNumeric(),
      validateRequestParams,
    ],
    createProduct,
  );

router
  .route("/:id")
  .get(
    [
      validateJwt,
      param("id", "Id Must be a MongoID").isMongoId(),
      validateRequestParams,
    ],
    getProduct,
  )
  .put(
    [
      validateJwt,
      isAdminLogged,
      param("id", "Id Must be a MongoID").isMongoId(),
      body("name", "If defined, name must have at least 4 characters")
        .optional()
        .isLength({ min: 4 }),

      body("name", "Name already in use").custom(async (name, { req }) => {
        const product = await Product.findOne({
          name,
          tp_status: true,
          $nor: [{ _id: req.params.id }],
        });

        if (!product) return true;

        throw new Error("Name already in use");
      }),

      body(
        "description",
        "If defined, description must have at least 10 characters and less than 200",
      )
        .optional()
        .isLength({ max: 200, min: 10 }),
      body("stock", "If defined, Stock must be an integer").optional().isInt(),
      body("price", "If defined, Price must be a number")
        .optional()
        .isNumeric(),
      validateRequestParams,
    ],
    updateProduct,
  )
  .delete(
    [
      validateJwt,
      isAdminLogged,
      param("id", "Id Must be a MongoID").isMongoId(),
      validateRequestParams,
    ],
    deleteProduct,
  );

export default router;
