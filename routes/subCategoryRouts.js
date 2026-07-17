const express = require("express");
const {
  createSubCategory,
  getSubCategories,
  getSubCategory,
  deleteSubCategory,
  updateSubcategory,
  setCategoyId,
  createFilterObj,
} = require("../services/subCategoryServies");
const {
  postSubCategoryValidator,
  getSubCategoryValidator,
  deleteSubCategoryValidator,
  updateSubCategoryValidator,
} = require("../utils/validators/subCategoryValidator");
const router = express.Router({ mergeParams: true });
const authService = require("../services/userAuth");
// protect and permissions
router.use(authService.protect, authService.allowTo("admin", "manger"));
// routes
router
  .route("/")
  .post(setCategoyId, postSubCategoryValidator, createSubCategory)
  .get(createFilterObj, getSubCategories);

router
  .route("/:id")
  .get(getSubCategoryValidator, getSubCategory)
  .delete(deleteSubCategoryValidator, deleteSubCategory)
  .put(updateSubCategoryValidator, updateSubcategory);

module.exports = router;
