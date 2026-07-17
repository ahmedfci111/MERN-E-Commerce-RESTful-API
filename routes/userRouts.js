const express = require("express");
const {
  getUsers,
  uploadUserImage,
  reSizeImage,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  changeUserPassword,
  getLoggedUserData,
  changeLoggedPassword,
  changeLoggedData,
  deActiveAccount,
  ActiveAccount,
} = require("../services/userServies");
const {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changePasswordValidator,
} = require("../utils/validators/userValidator");
const router = express.Router();
const authService = require("../services/userAuth");
const {
  updateLoggedUserValidator,
} = require("../utils/validators/loggedUserValidator");
//logged user route
//privet route protect
router.use(authService.protect);
router.get("/getMe", getLoggedUserData, getUser);
router.put("/changeMyPassword", changeLoggedPassword);
router.put("/changeMyData", updateLoggedUserValidator, changeLoggedData);
router.put("/deActiveMyAccount", deActiveAccount);
router.put("/ActiveMyAccount", ActiveAccount);

///////
//admin route
//privet and protect and permissions
router.use(authService.allowTo("admin"));
router.put("/changePassword/:id", changePasswordValidator, changeUserPassword);
router
  .route("/")
  .get(getUsers)
  .post(uploadUserImage, reSizeImage, createUserValidator, createUser);
router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(uploadUserImage, reSizeImage, updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

module.exports = router;
