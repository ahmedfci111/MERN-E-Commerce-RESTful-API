const express = require("express");
const router = express.Router();
const authService = require("../services/userAuth");
const { addAddress, getLoggedAddresses, deleteFromAddresses } = require("../services/addressesServies");

router.use(authService.protect, authService.allowTo("user"));

router.route('/').post(addAddress).get(getLoggedAddresses)
router.route('/:addressId').delete(deleteFromAddresses)


module.exports = router;