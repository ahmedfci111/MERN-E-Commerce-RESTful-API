const express = require("express");
const router = express.Router();
const authService = require("../services/userAuth");
const {
  createCoupon,
  getCoupons,
  getCoupon,
  deleteCoupon,
  updateCoupon,
} = require("../services/couponServies");

router.use(authService.protect, authService.allowTo("admin", "manger"));
router.route("/").post(createCoupon).get(getCoupons);
router
  .route("/:id")
  .get(getCoupon)
  .put(updateCoupon)
  .delete(deleteCoupon);

module.exports = router;
