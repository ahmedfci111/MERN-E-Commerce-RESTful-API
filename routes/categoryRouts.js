const express = require("express");
const router = express.Router();
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  setImageName,
  reSizeImage,
} = require("../services/categoryServies");
const {
  getCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
  postCategoryValidator,
} = require("../utils/validators/categoryValidator");
const subCategoryRouts = require("./subCategoryRouts");
const authService = require("../services/userAuth");
// protect and permissions
router.use(authService.protect, authService.allowTo("admin", "manger"));
// router.get('/',getCategory)
router.use("/:categoryId/subcategories", subCategoryRouts);
router
  .route("/")
  .get(getCategories)
  .post(
    uploadCategoryImage,
    reSizeImage,
    postCategoryValidator,
    createCategory,
  );
router
  .route("/:id")
  .get(getCategoryValidator, getCategory)
  .put(
    uploadCategoryImage,
    reSizeImage,
    updateCategoryValidator,
    updateCategory,
  )
  .delete(deleteCategoryValidator, deleteCategory);
module.exports = router;
