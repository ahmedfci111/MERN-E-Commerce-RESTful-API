const express = require("express");
const router = express.Router();
const authService = require("../services/userAuth");
const {
  createCashOrder,
  getOrder,
  getAllOrders,
  createFilter,
  updateToPayOrder,
  updateToDeliverOrder,
  checkoutSession,
} = require("../services/orderServies");
router.use(authService.protect);

//strip route
router.get('/checkoutSession/:id',  authService.allowTo( "user"),checkoutSession)
router
  .route("/")
  .get(
    authService.allowTo("admin", "manger", "user"),
    createFilter,
    getAllOrders,
  );
router.route("/:id").post( authService.allowTo( "user"),createCashOrder).get( authService.allowTo("admin", "manger", "user"),getOrder);
router.put(
  "/:id/pay",
  authService.allowTo("admin", "manger"),
  updateToPayOrder,
);
router.put(
  "/:id/deliver",
  authService.allowTo("admin", "manger"),
  updateToDeliverOrder,
);
module.exports = router;
