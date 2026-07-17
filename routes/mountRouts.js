const categoryRoute = require("./categoryRouts");
const subCategoryRoute = require("./subCategoryRouts");
const brandRoute = require("./brandRouts");
const productRoute = require("./productRouts");
const userRoute = require("./userRouts");
const authRoute = require("./authRouts");
const reviewRoute = require("./reviewRouts");
const wishListRoute = require("./wishListRouts");
const addressRoute = require("./addressRouts");
const couponRoute = require("./couponRouts");
const cartRoute = require("./cartRouts");
const orderRoute = require("./orderRouts");

exports.mountRoute = (app) => {
  app.use("/api/v1/categories", categoryRoute);
  app.use("/api/v1/subcategories", subCategoryRoute);
  app.use("/api/v1/Brands", brandRoute);
  app.use("/api/v1/Products", productRoute);
  app.use("/api/v1/Users", userRoute);
  app.use("/api/v1/Auth", authRoute);
  app.use("/api/v1/Review", reviewRoute);
  app.use("/api/v1/wishList", wishListRoute);
  app.use("/api/v1/address", addressRoute);
  app.use("/api/v1/Coupons", couponRoute);
  app.use("/api/v1/Cart", cartRoute);
  app.use("/api/v1/Order", orderRoute);
};
