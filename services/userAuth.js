const User = require("../models/userModel");
const ApiError = require("../utils/ApiError");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const sendEmail = require("../utils/sendEmail");
// sign-up
//public
//create user
//genrate toke

exports.signUp = asyncHandler(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
    expiresIn: process.env.EXPIRE_DATE,
  });
  res.status(201).json({
    status: "success",
    data: user,
    token,
  });
});
// login
exports.login = asyncHandler(async (req, res, next) => {
  // check email & password is correct
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError(`invalid email or password`, 404));
  }
  // genrate token
  const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
    expiresIn: process.env.EXPIRE_DATE,
  });
  res.status(201).json({
    status: "success",
    data: user,
    token,
  });
});
// protect route
exports.protect = asyncHandler(async (req, res, next) => {
  // 1 catch token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    console.log(token);
  }
  console.log(token);
  if (!token) {
    return next(new ApiError(`you are not login ,, please login again`, 401));
  }
  // verify token
  const decoded = jwt.verify(token, process.env.SECRET_KEY);
  console.log(decoded);
  // check user exist by user id returned by decoded
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(new ApiError(`user belong this token not exist ...`, 401));
  }
  //check active user
  if (!currentUser.active) {
    return next(
      new ApiError(
        `this account not active , please reActive your Account ...`,
        401,
      ),
    );
  }
  let passChangeTimeStamp;
  if (currentUser.passwordChangeAt) {
    //
    passChangeTimeStamp = parseInt(
      currentUser.passwordChangeAt.getTime() / 1000,
      10,
    );
  }
  // compare the times
  if (passChangeTimeStamp > decoded.iat) {
    return next(
      new ApiError(
        `user recently change this password , please login again ...`,
        401,
      ),
    );
  }
  req.user = currentUser;
  next();
});
exports.allowTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // access user from request
    // check a user role
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(`you are not allowed to access this routes  ...`, 403),
      );
    }
    next();
  });

// dse forget passsword
//public
exports.forgetPassword = asyncHandler(async (req, res, next) => {
  // check user by email is exist
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`not found user by this email  ...${req.body.email}`, 404),
    );
  }
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashRestCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");
  user.passwordRestCode = hashRestCode;
  //generate expire time
  user.passwordResetExpire = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerify = false;
  await user.save();
  // send email
  const message = `HI ${user.user}\n we recived a request to reset your password e-shop account \n ${resetCode}\n enter the verify code`;
  await sendEmail({
    email: user.email,
    subject: "your password rest code (valid to 10 min )",
    message,
  });
  res.status(200).json({
    status: "success",
    message: "reset code sent to email",
  });
});
//desc verify reset code
// public
exports.verifyResetCode = asyncHandler(async (req, res, next) => {
  // get reset code and encrypt
  const hashRestCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");
  // find user by reset code and expire time = true
  const user = await User.findOne({
    passwordRestCode: hashRestCode,
    passwordResetExpire: { $gt: Date.now() },
  });
  // check find user
  if (!user) {
    return next(new ApiError(`invalid Reset Code Or Expire Time `, 401));
  }
  user.passwordResetVerify = true;
  user.save();
  res.status(200).json({
    status: "success Verify",
  });
});
// reset password
// public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError(`incorrect email .. please try again `, 404));
  }
  if (!user.passwordResetVerify) {
    return next(
      new ApiError(`reset code not verify .. please try again `, 401),
    );
  }
  user.password = req.body.newPassword;
  user.passwordResetExpire = undefined;
  user.passwordResetVerify = undefined;
  user.passwordRestCode = undefined;
  await user.save();

  // generate new token
  const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
    expiresIn: process.env.EXPIRE_DATE,
  });
  // return response

  res.status(200).json({
    status: "success",
    token,
  });
});
