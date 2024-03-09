import { validationResult } from "express-validator";

export const validateRequestParams = async (req, res, next) => {
  const result = validationResult(req);
  console.log({ errors: result.errors });
  if (!result.isEmpty()) {
    return res.status(400).json({ errors: result.array() });
  }

  next();
};
