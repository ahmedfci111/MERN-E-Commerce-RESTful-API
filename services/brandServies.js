const BrandModel = require("../models/BrandModel");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const factory = require("./handelersFactory");
const asyncHandler = require("express-async-handler");
const { uploadSingleImage } = require("../middleWares/uploadImagesMiddleware");

// desc for get all categories method
// public
// upload single image
exports.uploadBrandImage = uploadSingleImage("image")
exports.reSizeImage = asyncHandler(async (req, res, next) => {
  const filename = `brand${uuidv4()}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .toFile(`uploads/brand/${filename}`);

  req.body.image = filename;
  console.log("filename:", filename);
  console.log("body after:", req.body);
  next();
});
//
exports.getBrands = factory.getAll(BrandModel);
// get category by id
exports.getBrand = factory.getOne(BrandModel);

// create a new category
//privet
exports.createBrand = factory.createOne(BrandModel);

// update category
//privet
exports.updateBrand = factory.updateOne(BrandModel);
// update category
//privet
//refactor handelers
exports.deleteBrand = factory.deleteOne(BrandModel);
