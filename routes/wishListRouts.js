const express = require("express");
const router = express.Router();
const authService = require("../services/userAuth");
const { addToWishList, deleteFromWishList, getLoggedWishList } = require("../services/wishListServies");
router.use(authService.protect, authService.allowTo("user"));
router.route('/').post(addToWishList).get(getLoggedWishList)
router.route('/:productId').delete(deleteFromWishList)


module.exports = router;