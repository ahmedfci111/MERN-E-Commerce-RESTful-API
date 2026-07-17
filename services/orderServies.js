const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const factory = require("./handelersFactory");

const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
//strip
const stripe = require('stripe')(process.env.STRIPE_API_KEY)

// create cash order
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  // get cart by cart id from params
  const cart = await Cart.findOne({ _id: req.params.id });
  if (!cart) {
    return next(new ApiError("invalid cart id", 404));
  }
  // get order price depend cart price
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalPrice;
  const totalOrderPrice = cartPrice;

  //create order
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    totalOrderPrice: totalOrderPrice,
  });
  // update product quantity and solid after order
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: {
          $inc: {
            quantity: -item.quantity,
            sold: item.quantity,
          },
        },
      },
    }));

    await Product.bulkWrite(bulkOption);
    // clear the cart
    await Cart.findOneAndDelete({ _id: req.params.id });
  }
  res.status(201).json({
    status: "success",
    message: "your order complete done ",
  });
});
//  create user filter object
exports.createFilter = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") req.filterObj = { user: req.user._id };
  next();
});
// get all user order
exports.getAllOrders = factory.getAll(Order, {
  path: "user",
  select: "name email",
  path: "cartItems.product",
  select: "title rating",
});
// get order id
exports.getOrder = factory.getOne(Order, {
  path: "user",
  select: "name email",
  path: "cartItems.product",
  select: "title rating",
});
//update tp pay order by admin and manger
exports.updateToPayOrder = asyncHandler(async (req, res, next) => {
  //get order by id
  const order = await Order.findById({ _id: req.params.id });
  if (!order) {
    return next(new ApiError("invalid order id", 404));
  }
  order.isPaid = true;
  order.paidAt = Date.now();
  const updatedOrder = await order.save();
  res.status(201).json({
    status: "success",
    message: "order paid success ",
    data: updatedOrder,
  });
});
//update tp Deliver order by admin and manger
exports.updateToDeliverOrder = asyncHandler(async (req, res, next) => {
  //get order by id
  const order = await Order.findById({ _id: req.params.id });
  if (!order) {
    return next(new ApiError("invalid order id", 404));
  }
  order.isDeliver = true;
  order.deliveredAt = Date.now();
  const updatedOrder = await order.save();
  res.status(201).json({
    status: "success",
    message: "order delivered success ",
    data: updatedOrder,
  });
});
//checkout fun
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  // get user cart 
   const cart = await Cart.findOne({ _id: req.params.id });
  if (!cart) {
    return next(new ApiError("invalid cart id", 404));
  }
  // get order price depend cart price
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalPrice;
  const totalOrderPrice = cartPrice;
// create session
//  const session = await stripe.checkout.sessions.create({
//     line_items: [
//       // {
//       //   // Provide the exact Price ID (for example, price_1234) of the product you want to sell
//       //   amount: totalOrderPrice * 100 ,
//       //   quantity: 1,
//       //   name : req.user.name,
//       //    currency: "usd",

//       // },
//       line_items: [
//     {
//       price_data: {
//         currency: "egp",
//         unit_amount: totalOrderPrice * 100,
//         product_data: {
//           name: req.user.name,
//         },
//       },
//       quantity: 1,
//     },
//     ],
//     mode: 'payment',
//     customer_email:req.user.email,
//     client_reference_id:cart._id.toString(),
//     // metadata:req.body.shippingAddress,
//     success_url: `${req.protocol}://${req.get('host')}/Order`,
//     cancel_url:`${req.protocol}://${req.get('host')}/Cart`,
//   });
const session = await stripe.checkout.sessions.create({
  payment_method_types: ["card"],

  mode: "payment",

  customer_email: req.user.email,

  client_reference_id: cart.id,

  line_items: [
    {
      price_data: {
        currency: "egp",
        unit_amount: totalOrderPrice * 100,
        product_data: {
          name: "Shopping Cart",
        },
      },
      quantity: 1,
    },
  ],

  success_url: `${req.protocol}://${req.get("host")}/Order`,
  cancel_url: `${req.protocol}://${req.get("host")}/Cart`,
});
  res.status(200).json({
    status:"success",
    session
  })
});
