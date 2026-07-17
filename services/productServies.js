const ProductModel = require("../models/productModel");
const factory = require("./handelersFactory");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const { uploadImages } = require("../middleWares/uploadImagesMiddleware");
// desc for get all categories method
// public
//
//uploads images

exports.uploadImages = uploadImages([
  { name: "coverImage", maxCount: 1 },
  { name: "images", maxCount: 4 },
]);
exports.reSizeImage = asyncHandler(async (req, res, next) => {

  if (req.files.coverImage) {
    const filename = `product${uuidv4()}-${Date.now()}.jpeg`;
    await sharp(req.files.coverImage[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .toFile(`uploads/product/${filename}`);

    req.body.coverImage = filename;
  }
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const filename = `product${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .toFile(`uploads/product/${filename}`);
        req.body.images.push(filename);
      }),
    );
  }
  next();

});
exports.getProducts = factory.getAll(ProductModel, [
  {
    path: "category",
    select: "name",
  },
  {
    path: "brand",
    select: "name",
  },
  {
    path: "subCategories",
    select: "name",
  },
  {
    path: "subCategories",
    select: "name",
  },"reviews"
]);
// get category by id
exports.getProduct = factory.getOne(ProductModel, [
  {
    path: "category",
    select: "name",
  },
  {
    path: "brand",
    select: "name",
  },
  {
    path: "subCategories",
    select: "name",
  },
  "reviews"
]);

// create a new category
//privet
exports.createProduct = factory.createOne(ProductModel);

//privet
exports.updateProduct = factory.updateOne(ProductModel);

//privet
exports.deleteProduct = factory.deleteOne(ProductModel);
