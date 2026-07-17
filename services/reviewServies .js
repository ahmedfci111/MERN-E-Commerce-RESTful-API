const Review = require("../models/reviewModel");

const factory = require("./handelersFactory");
const asyncHandler = require("express-async-handler");
//nased route
exports.createFilterObj = (req,res,next)=>{
  let filterObj = {};
  if(req.params.productId)filterObj ={product:req.params.productId}
  req.filterObj =filterObj ;
  next();
}


//
exports.getReviews = factory.getAll(Review,[
     {
    path: "user",
    select: "name",
  }
]);
// get category by id
exports.getReview = factory.getOne(Review,[
     {
    path: "user",
    select: "name",
  }
]);
//nested route to set product id and user id to body automatic
exports.setProductIdAndUser = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if(!req.body.user)req.body.user = req.user._id;
  next();
};
// create a new category
//privet
exports.createReview = factory.createOne(Review);

// update category
//privet
exports.updateReview = factory.updateOne(Review);
// update category
//privet
//refactor handelers
exports.deleteReview = factory.deleteOne(Review);
