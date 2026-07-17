const slugify = require("slugify");
const { check,body } = require("express-validator");
const {
  validatorMiddleware,
} = require("../../middlewares/validatorMiddleware");
const ApiError = require("../ApiError");
const CategoryModel = require("../../models/categoryModel");
const SubCategoriesModel = require("../../models/subCategoryModel")
exports.createProductValidator = [
  check("title")
    .notEmpty()
    .withMessage("Product title is required")
    .isLength({ min: 3 })
    .withMessage("Title is too short")
    .isLength({ max: 32 })
    .withMessage("Title is too long")
    .custom((val,{req})=>{
    req.body.slug = slugify(val)
    return true ;
      }),

  check("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 32 })
    .withMessage("Description is too short"),

  check("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isNumeric()
    .withMessage("Quantity must be a number"),

  check("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 2 })
    .withMessage("Price must be greater than or equal to 2"),

  check("priceAfterDescount")
    .optional()
    .isFloat()
    .withMessage("Price after discount must be a number")
    .custom((value, { req }) => {
      if (value >= req.body.price) {
        return next(new ApiError(`can not find categories`, 404));
      }
      return true;
    }),

  check("coverImage").notEmpty().withMessage("Cover image is required"),

  check("images").optional().isArray().withMessage("Images must be an array"),

  check("colors").optional().isArray().withMessage("Colors must be an array"),

  check("ratingAverage")
    .optional()
    .isNumeric()
    .withMessage("Rating must be a number")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating average must be between 1 and 5"),

  check("rating").optional().isNumeric().withMessage("Rating must be a number"),

  check("category")
    .notEmpty()
    .withMessage("Product must belong to a category")
    .isMongoId()
    .withMessage("Invalid category id")
    .custom((categoryId) => {
      return CategoryModel.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(
            new Error(`do not have category for this id :: ${categoryId}`),
          );
        }
      });
    }),

  check("brand").optional().isMongoId().withMessage("Invalid brand id"),

  check("subCategories")
    .optional()
    .isArray()
    .withMessage("Subcategories must be an array")
    .custom((subCategoriesIds)=>{
        return SubCategoriesModel.find({_id:{$exists:true,$in:subCategoriesIds}}).then((result)=>{
            if(result<1 ||result.length !==subCategoriesIds.length ){
                return Promise.reject(
            new Error(`check sub-categories ids entered :: `),
          );
            }
        })
    })
   .custom((val, { req }) => {
  return SubCategoriesModel.find({
    category: req.body.category,
  }).then((subcategories) => {
    const subCategoriesIdsInDb = subcategories.map((subCategory) =>
      subCategory._id.toString()
    );

    if (!val.every((v) => subCategoriesIdsInDb.includes(v))) {
      return Promise.reject(
        new Error("Subcategories do not belong to this category")
      );
    }

    return true;
  });
}),

  check("subCategory.*")
    .optional()
    .isMongoId()
    .withMessage("Invalid subcategory id"),

  validatorMiddleware,
];
exports.updateProductValidator = [
  check("id").isMongoId().withMessage("Invalid product id"),

  check("title").optional().isLength({ min: 3, max: 32 }),

  check("description").optional().isLength({ min: 32 }),

  check("price").optional().isFloat({ min: 2 }),

  check("category").optional().isMongoId(),

  check("brand").optional().isMongoId(),

  check("subCategory.*").optional().isMongoId(),
  body('title').optional().custom((val,{req})=>{
req.body.slug = slugify(val)
return true ;
  }),

  validatorMiddleware,
];
