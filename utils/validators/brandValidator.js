const { check, body } = require("express-validator");
const {
  validatorMiddleware,
} = require("../../middlewares/validatorMiddleware");
const slugify = require("slugify");

exports.getBrandValidator = [
  check("id").isMongoId().withMessage("Invalid Brand ID format"),

  validatorMiddleware,
];

exports.updateBrandValidator = [
  check("id").isMongoId().withMessage("Invalid Brand ID format"),
  body('name').optional().custom((val,{req})=>{
req.body.slug = slugify(val)
return true ;
  }),
  validatorMiddleware,
];
exports.deleteBrandValidator = [
  check("id").isMongoId().withMessage("Invalid Brand ID format"),

  validatorMiddleware,
];
exports.postBrandValidator = [
  check("name")
    .notEmpty()
    .withMessage("Invalid Brand name format")
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
