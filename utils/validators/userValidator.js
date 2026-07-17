const { check, body } = require("express-validator");
const slugify = require("slugify");
const User = require("../../models/userModel");
const {
  validatorMiddleware,
} = require("../../middlewares/validatorMiddleware");
const bcrypt = require("bcryptjs");

// ================= Create User =================
exports.createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("User name is required")
    .isLength({ min: 3 })
    .withMessage("Name is too short")
    .isLength({ max: 32 })
    .withMessage("Name is too long"),

  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (val) => {
      const user = await User.findOne({ email: val });
      if (user) {
        return Promise.reject(new Error("Email already exists"));
      }
    }),

  check("phone")
    .optional()
    .isMobilePhone(["ar-EG"])
    .withMessage("Invalid Egyptian phone number"),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((val, { req }) => {
      if (val !== req.body.password) {
        throw new Error("Password confirmation is incorrect");
      }
      return true;
    }),

  check("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Invalid user role"),

  body("name").custom((val, { req }) => {
    req.body.slug = slugify(val);
    return true;
  }),

  validatorMiddleware,
];

// ================= Get User =================
exports.getUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id"),
  validatorMiddleware,
];

// ================= Update User =================
exports.updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id"),

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

  check("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Invalid user role"),

  body("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  validatorMiddleware,
];

// ================= Delete User =================
exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id"),
  validatorMiddleware,
];
exports.changePasswordValidator = [
  check("id").isMongoId().withMessage("Invalid user id"),

  body("currentPassword")
    .notEmpty()
    .withMessage("current password required ..."),
  body("passwordConfirm")
    .notEmpty()
    .withMessage("password confirm required ..."),
  body("password")
    .notEmpty()
    .withMessage("password required ")
    .custom(async (val, { req }) => {
      // verfiy current password
      const user = await User.findById(req.params.id);
      if (!user) {
        throw new Error("user is not exist ....");
      }
      const isCorrect = await bcrypt.compare(req.body.currentPassword, user.password);
      if (!isCorrect) {
        throw new Error("incorrect current password");
      }
      // check confirm password \
      if (val !== req.body.passwordConfirm) {
        throw new Error("incorrect confirm password");
      }
      return true
    }),
  validatorMiddleware,
];
