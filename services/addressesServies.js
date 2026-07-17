const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

exports.addAddress = asyncHandler(async (req, res, next) => {
  // get login user and add address to wish list
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body },
    },
    { new: true },
  );
  res.status(200).json({
    status: "success",
    message: "your address created",
    data: user.addresses,
  });
});
//remove address wish list
exports.deleteFromAddresses = asyncHandler(async (req, res, next) => {
  // get login user and remove address from wish list
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { addresses:{_id: req.params.addressId }},
    },
    { new: true },
  );
  res.status(200).json({
    status: "success",
    message: "address deleted from your addresses list",
    data: user.addresses,
  });
});
// get wish list for logged user
exports.getLoggedAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    status: "success",
    results: user.addresses.length,
    data: user.addresses,
  });
});
