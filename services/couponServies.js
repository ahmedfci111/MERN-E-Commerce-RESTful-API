const factory = require("./handelersFactory");
const Coupon = require("../models/couponModel");
const asyncHandler = require("express-async-handler");

//all servies protected and have permissions to (admin , manger)
exports.getCoupons = factory.getAll(Coupon);
// get Coupon by id
exports.getCoupon = factory.getOne(Coupon);

// create a new Coupon
//privet
exports.createCoupon = factory.createOne(Coupon);

// update Coupon
//privet
exports.updateCoupon = factory.updateOne(Coupon);
// update Coupon
//privet
//refactor handelers
exports.deleteCoupon = factory.deleteOne(Coupon);
