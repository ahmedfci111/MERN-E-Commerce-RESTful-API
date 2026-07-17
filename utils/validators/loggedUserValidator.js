const { validatorMiddleware } =require('../../middleWares/validatorMiddleware')
const { check, body } = require("express-validator");
const User = require("../../models/userModel");
const slugify = require("slugify");
// ================= Update logged  User =================
exports.updateLoggedUserValidator = [
  

  check("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Name is too short")
    .isLength({ max: 32 })
    .withMessage("Name is too long"),

  check("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (val, { req }) => {
      const user = await User.findOne({ email: val });

      if (user && user._id.toString() !== req.params.id) {
        return Promise.reject(new Error("Email already exists"));
      }
    }),

  check("phone")
    .optional()
    .isMobilePhone(["ar-EG"])
    .withMessage("Invalid Egyptian phone number"),


  body("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  validatorMiddleware,
];
