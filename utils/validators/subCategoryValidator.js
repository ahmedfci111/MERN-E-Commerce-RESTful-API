const { check ,body} = require("express-validator");
const slugify = require("slugify");
const { validatorMiddleware } = require("../../middlewares/validatorMiddleware");
const CategoryModel = require("../../models/categoryModel");
exports.getSubCategoryValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Category ID format"),

  validatorMiddleware,
];
exports.deleteSubCategoryValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Category ID format"),

  validatorMiddleware,
];
exports.updateSubCategoryValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Category ID format"),
    check("name")
    .notEmpty()
    .withMessage("Invalid Category name format")
    .isLength({min:2})
    .withMessage('length too short ')
    .isLength({max:32})
    .withMessage('length too long'),
    check("category")
     .notEmpty().withMessage('sub category must be belond a category')  
     .isMongoId().withMessage('category id not correct') ,
    body('name').custom((val,{req})=>{
req.body.slug = slugify(val)
return true ;
  }),

  validatorMiddleware
];

exports.postSubCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Invalid Category name format")
    .isLength({ min: 2 })
    .withMessage("length too short")
    .isLength({ max: 32 })
    .withMessage("length too long"),

  body("name").custom((val, { req }) => {
    req.body.slug = slugify(val);
    return true;
  }),

  check("category")
    .notEmpty()
    .withMessage("sub category must belong to a category")
    .isMongoId()
    .withMessage("category id not correct")
    .custom((categoryId) => {
      return CategoryModel.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(
            new Error(`do not have category for this id :: ${categoryId}`)
          );
        }
      });
    }),

  validatorMiddleware,
];






