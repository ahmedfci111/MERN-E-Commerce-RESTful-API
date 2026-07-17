const express = require("express");
const router = express.Router();
const authService = require("../services/userAuth");
const {
  addProductToCart,
  getLoggedUserCart,
  deleteProductFromCart,
  clearCart,
  updateProductQuantity,
  applyCoupon,
} = require("../services/cartServies");

router.use(authService.protect, authService.allowTo("user"));
router
  .route("/")
  .post(addProductToCart)
  .get(getLoggedUserCart)
  .delete(clearCart);
  router.put("/applyCoupon", applyCoupon);
router.route("/:id").delete(deleteProductFromCart).put(updateProductQuantity);


module.exports = router;
