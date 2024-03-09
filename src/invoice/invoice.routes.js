import { Router } from "express";
import { validateJwt } from "../middleware/validate-jwt.js";
import { isAdminLogged } from "../middleware/is-logged.js";
import { param, query } from "express-validator";
import { validateRequestParams } from "../middleware/validate-request-params.js";
import Sale from "../sale/sale.model.js";

const router = Router();

router.get(
  "/",
  [
    validateJwt,
    isAdminLogged,
    query("limit", "Limit must be an integer").optional().isNumeric(),
    query("page", "Page must be an integer").optional().isNumeric(),
    validateRequestParams,
  ],
  async (req, res) => {
    // get all sales
    const { limit = 0, page = 5 } = req.query;

    const [total, sales] = await Promise.allSettled([
      Sale.countDocuments(),
      Sale.find()
        .limit(parseInt(limit))
        .skip(parseInt(page * limit)),
    ]);

    return res.json({ total: total.value, sales: sales.value });
  },
);

router.get(
  "/:id",
  [
    validateJwt,
    isAdminLogged,
    param("id", "Id must be a valid ObjectId").isMongoId(),
    validateRequestParams,
  ],
  async (req, res) => {
    // get sale by id
    const { id } = req.params;

    const sale = await Sale.findById(id);

    if (!sale) return res.status(404).json({ message: "Sale not found" });

    return res.status(200).json(sale);
  },
);

export default router;
