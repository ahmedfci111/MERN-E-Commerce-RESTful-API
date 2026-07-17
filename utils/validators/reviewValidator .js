const { check, body } = require("express-validator");
const Review = require("../../models/reviewModel");

const {
  validatorMiddleware,
} = require("../../middlewares/validatorMiddleware");

exports.updateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review ID format")
    .custom((val, { req }) => {
      return Review.findById(val).then((review) => {
        if (!review) {
          return Promise.reject(new Error("Invalid review id"));
        }

        if (review.user._id.toString()!== req.user._id.toString()) {
          return Promise.reject(
            new Error("You are not allowed to perform this action")
          );
        }

        return true;
      });
    }),
  validatorMiddleware,
];
exports.deleteReviewValidator = [
check("id")
    .isMongoId()
    .withMessage("Invalid Review ID format")
    .custom((val, { req }) => {
      if(req.user.role==='user'){
        return Review.findById(val).then((review) => {
        if (!review) {
          return Promise.reject(new Error("Invalid review id"));
        }

        if (review.user._id.toString()!== req.user._id.toString()) {
          return Promise.reject(
            new Error("You are not allowed to perform this action")
          );
        }

        return true;
      });
      }
    }),

  validatorMiddleware,
];
exports.postReviewValidator = [
  check("name").optional(),
  check("ratings")
    .notEmpty()
    .withMessage("ratings value required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("ratings value must be between 1 : 5"),
  check("user").isMongoId().withMessage("invalid user id"),
  check("product")
    .isMongoId()
    .withMessage("invalid product id ")
    .custom((val, { req }) =>
      Review.findOne({ user: req.user._id, product: req.body.product }).then(
        (review) => {
          if (review) {
            return Promise.reject(
              new Error("you already create a review before for this product"),
            );
          }
        },
      ),
    ),
  validatorMiddleware,
];
