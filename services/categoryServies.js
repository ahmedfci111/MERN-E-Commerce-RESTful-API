const CategoryModel = require("../models/categoryModel");
const multer = require("multer");
const asyncHandler = require("express-async-handler");

const factory = require("./handelersFactory");
const ApiError = require("../utils/ApiError");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp"); // upload image middleware
const { uploadSingleImage } = require("../middleWares/uploadImagesMiddleware");


exports.uploadCategoryImage = uploadSingleImage("image")

// resize image
exports.reSizeImage = asyncHandler(async (req, res, next) => {
  const filename = `category${uuidv4()}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .toFile(`uploads/category/${filename}`);

  req.body.image = filename;
 console.log("filename:", filename);
console.log("body after:", req.body);
  next();
});
// desc for get all categories method
// public
//
exports.getCategories = factory.getAll(CategoryModel);

// get category by id
exports.getCategory = factory.getOne(CategoryModel);

// create a new category
//privet
exports.createCategory = factory.createOne(CategoryModel);
// update category
//privet
exports.updateCategory = factory.updateOne(CategoryModel);

// update category
//privet
exports.deleteCategory = factory.deleteOne(CategoryModel);
