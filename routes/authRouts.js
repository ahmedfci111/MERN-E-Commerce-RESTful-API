const express = require("express");

const {
  signUp,
  login,
  forgetPassword,
  verifyResetCode,
  resetPassword,
} = require("../services/userAuth");

const {
  signUpValidator,
  loginValidator,
} = require("../utils/validators/authValidator");



const router = express.Router();

router.route("/Signup").post(signUpValidator, signUp);
router.route("/Login").post(loginValidator, login);
router.route("/forgetPassword").post(forgetPassword);
router.route("/verifyPassword").post(verifyResetCode);
router.route("/resetPassword").put(resetPassword);

module.exports = router;