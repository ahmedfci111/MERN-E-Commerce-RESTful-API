const express = require("express");
const {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  uploadImages,
  reSizeImage,
} = require("../services/productServies");
const {
  createProductValidator,
  updateProductValidator,
} = require("../utils/validators/productValidator");
const reviewRoute = require("./reviewRouts");
const router = express.Router();
const authService = require("../services/userAuth");
//nasted route get all reviews for product-id
router.use("/:productId/Review",reviewRoute)
// protect and permissions
router.use(authService.protect, authService.allowTo("admin", "manger"));
//routes
router
  .route("/")
  .get(getProducts)
  .post(uploadImages, reSizeImage, createProductValidator, createProduct);
router
  .route("/:id")
  .get(getProduct)
  .put(updateProductValidator, updateProduct)
  .delete(deleteProduct);

module.exports = router;
