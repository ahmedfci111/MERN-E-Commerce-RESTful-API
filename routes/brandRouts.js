const express = require("express");
const {
  getBrands,
  createBrand,
  getBrand,
  updateBrand,
  deleteBrand,
  uploadBrandImage,
  reSizeImage,
} = require("../services/brandServies");
const {
  postBrandValidator,
  getBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
} = require("../utils/validators/brandValidator");
const router = express.Router();
const authService = require("../services/userAuth");
router.use(authService.protect, authService.allowTo("admin", "manger"));
router
  .route("/")
  .get(getBrands)
  .post(uploadBrandImage, reSizeImage, postBrandValidator, createBrand);
router
  .route("/:id")
  .get(getBrandValidator, getBrand)
  .put(uploadBrandImage, reSizeImage, updateBrandValidator, updateBrand)
  .delete(deleteBrandValidator, deleteBrand);
module.exports = router;
