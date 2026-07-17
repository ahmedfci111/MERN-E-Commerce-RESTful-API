const User = require("../models/userModel");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const factory = require("./handelersFactory");
const asyncHandler = require("express-async-handler");
const { uploadSingleImage } = require("../middleWares/uploadImagesMiddleware");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcryptjs");
const createToken = require("../utils/createToken");
// desc for get all categories method
// all user routes portect
// upload single image
exports.uploadUserImage = uploadSingleImage("profileImage");
exports.reSizeImage = asyncHandler(async (req, res, next) => {
  const filename = `profile${uuidv4()}-${Date.now()}.jpeg`;
  if (!req.file) {
    return next();
  }
  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .toFile(`uploads/user/${filename}`);

  req.body.profileImage = filename;
  console.log("filename:", filename);
  console.log("body after:", req.body);
  next();
});
//
exports.getUsers = factory.getAll(User);
//
exports.getUser = factory.getOne(User);

//
//privet
exports.createUser = factory.createOne(User);

// update
//privet
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (req.body.password) {
    return next(new ApiError(`Can not update password by this route `, 404));
  }
  const document = await User.findByIdAndUpdate(
    id,
    {
      name: req.body.name,

      phone: req.body.phone,
      email: req.body.email,
      profileImage: req.body.profileImage,
      role: req.body.role,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!document) {
    return next(new ApiError(`Can not find document by id: ${id}`, 404));
  }

  res.status(200).json({
    status: "success",
    data: document,
  });
});
///////
exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const document = await User.findByIdAndUpdate(
    id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangeAt: Date.now(),
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!document) {
    return next(new ApiError(`Can not find document by id: ${id}`, 404));
  }

  res.status(200).json({
    status: "success",
    data: document,
  });
});
// update
//privet
//refactor
exports.deleteUser = factory.deleteOne(User);
//get logged user data
//privet
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});
//change logged user password
//privet
exports.changeLoggedPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(
    req.user._id,

    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangeAt: Date.now(),
    },
    {
      new: true,
      runValidators: true,
    },
  );
  //generate new token
  const token = createToken(user._id);
  res.status(200).json({
    status: "success",
    data: user,
    token,
  });
});
//change logged user data expect password,role
//privet
exports.changeLoggedData = asyncHandler(async (req, res, next) => {
  const user = await User.findOneAndUpdate(
    req.user._id,
    {
      email: req.body.email,
      name: req.body.name,
      phone: req.body.phone,
    },
    {
      new: true,
      runValidators: true,
    },
  );
  res.status(200).json({
    status: "success",
    data: user,
  });
});
exports.deActiveAccount = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      active: false,
    },
    {
      new: true,
      runValidators: true,
    },
  );
  res.status(204).json({
    status:"success",
    message:'your acc de active'
  })
});
exports.ActiveAccount = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      active: true,
    },
    {
      new: true,
      runValidators: true,
    },
  );
  res.status(204).json({
    status:"success",
    message:'your acc active now '
  })
});


