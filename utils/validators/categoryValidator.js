const { check ,body} = require("express-validator");
const {
  validatorMiddleware,
} = require("../../middlewares/validatorMiddleware");
const slugify = require("slugify");

exports.getCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid Category ID format"),

  validatorMiddleware,
];

exports.updateCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid Brand ID format"),
    body('name').optional().custom((val,{req})=>{
  req.body.slug = slugify(val)
     return true ;
    }),
    validatorMiddleware,
];
exports.deleteCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid Category ID format"),

  validatorMiddleware,
];
exports.postCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Invalid Category name format")
    .isLength({ min: 3 })
    .withMessage("length too short ")
    .isLength({ max: 32 })
    .withMessage("length too long")
    .custom((val,{req})=>{
    req.body.slug = slugify(val)
    return true ;
      }),

  validatorMiddleware,
];
