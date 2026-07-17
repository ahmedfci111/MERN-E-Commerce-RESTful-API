const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");

exports.addToWishList = asyncHandler(async (req, res, next) => {
  // get login user and add product to wish list
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishList: req.body.productId },
    },
    { new: true },
  );
  res.status(200).json({
    status: "success",
    message: "product added to your wish list",
    data: user.wishList,
  });
});
//remove product wish list
exports.deleteFromWishList = asyncHandler(async (req, res, next) => {
  // get login user and remove product from wish list
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishList: req.params.productId },
    },
    { new: true },
  );
  res.status(200).json({
    status: "success",
    message: "product deleted from your wish list",
    data: user.wishList,
  });
});
// get wish list for logged user
exports.getLoggedWishList = asyncHandler(async(req,res,next)=>{
    const user = await User.findById(req.user._id).populate("wishList")

    res.status(200).json({
        status:"success",
        results:user.wishList.length,
        data : user.wishList
    })
})
