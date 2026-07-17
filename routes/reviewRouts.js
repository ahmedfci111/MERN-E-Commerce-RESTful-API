const express = require("express");
const { getReviews, createReview, getReview, updateReview, deleteReview, createFilterObj, setProductIdAndUser } = require("../services/reviewServies ");

const router = express.Router({ mergeParams: true });

const authService = require("../services/userAuth");
const { postReviewValidator, updateReviewValidator, deleteReviewValidator } = require("../utils/validators/reviewValidator ");

router.use(authService.protect );
router
  .route("/")
  .get(createFilterObj,getReviews)
  .post(authService.allowTo("user"),setProductIdAndUser,postReviewValidator, createReview);
router
  .route("/:id")
  .get( authService.allowTo("user"),getReview)
  .put(authService.allowTo("user"), updateReviewValidator,updateReview)
  .delete(authService.allowTo("user","admin","manger"),deleteReviewValidator, deleteReview);
module.exports = router;
