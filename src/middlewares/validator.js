import { validationResult } from "express-validator";

const validateApi = (req, res, next) => {
  const error = validationResult(req);

  if (error.isEmpty()) {
    return next();
  }
  const extractedErrors = {};

  error
    .array({ onlyFirstError: true })
    .map((err) => (extractedErrors[err.path] = err.msg));
  const responsePayload = {
    status: 417,
    message: null,
    data: null,
    error: extractedErrors,
  };

  return res.status(417).json(responsePayload);
};

export default validateApi;
