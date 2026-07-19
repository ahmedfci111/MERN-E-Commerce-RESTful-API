const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const factory = require("./handelersFactory");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
//strip
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

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
    status: "success",
    session,
  });
});
//webhook deploy
const createCardOrder = async (session) => {
  try {
    console.log("========== WEBHOOK ==========");
    console.log("Session ID:", session.id);

    const cartId = session.client_reference_id;
    const shippingAddress = session.metadata;
    const orderPrice = session.amount_total / 100;

    console.log("Cart ID:", cartId);
    console.log("Customer Email:", session.customer_email);

    const cart = await Cart.findById(cartId);

    if (!cart) {
      throw new Error("Invalid cart id");
    }

    const user = await User.findOne({
      email: session.customer_email,
    });

    if (!user) {
      throw new Error("User not found");
    }

    const order = await Order.create({
      user: user._id,
      cartItems: cart.cartItems,
      totalOrderPrice: orderPrice,
      shippingAddress,
      isPaid: true,
      paidAt: Date.now(),
      paymentMethodType: "card",
    });

    console.log("Order created:", order._id);

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
    console.log("Products updated");

    await Cart.findByIdAndDelete(cartId);
    console.log("Cart deleted");

    console.log("========== WEBHOOK DONE ==========");
  } catch (err) {
    console.error("Create Card Order Error:");
    console.error(err);
  }
};
exports.webHookCheckout = asyncHandler(async (req, res, next) => {
  let event;
  if (process.env.STRIPE_WEB_HOOK) {
    // Get the signature sent by Stripe
    const signature = req.headers["stripe-signature"];
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEB_HOOK,
      );
    } catch (err) {
      console.log(`⚠️ Webhook signature verification failed.`, err.message);
      return res.sendStatus(400);
    }
    if (event.type === "checkout.session.completed") {
      await createCardOrder(event.data.object);
    }
    res.status(201).json({ received: true });
  }
});
