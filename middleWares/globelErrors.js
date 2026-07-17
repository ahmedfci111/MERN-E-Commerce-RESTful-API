const ApiError = require("../utils/ApiError");
const hnadeljwtInvalid = () =>
  new ApiError(` invalid jwt token , please login agin`, 401);
const expireToken = () =>
  new ApiError(` expired jwt token , please login again`, 401);

const globelErrors = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (err.code === 11000) {
    err = new ApiError(`${Object.keys(err.keyValue)} already exists`, 409);
  }

  if (process.env.NODE_ENV === "development") {
    errorDev(err, res);
  } else {
    if (err.name == "JsonWebTokenError") err = hnadeljwtInvalid();
    if (err.name == "TokenExpiredError") err = expireToken();

    errorProd(err, res);
  }
};

const errorDev = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const errorProd = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

module.exports = globelErrors;
