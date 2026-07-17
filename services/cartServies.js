const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const ProductModel = require("../models/productModel");

//calc the total price
const calcTotalCartPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.price * item.quantity;
  });
  cart.totalPrice = totalPrice;
  return totalPrice;
};
//add product to cart list
//privet / user
exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;
  //get to product to get the price
  const product = await ProductModel.findById(productId);
  // get the cart user
  let cart = await Cart.findOne({ user: req.user._id });

  //check user have cart
  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [
        {
          product: productId,
          color,
          price: product.price,
        },
      ],
    });
  } else {
    //check product exist in cart , update product quantity
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.color === color,
    );
    //productIndex have value , update quantity
    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;
    } else {
      //product not exist , add new product to cartItems
      cart.cartItems.push({
        product: productId,
        color,
        price: product.price,
      });
    }
  }
 
  calcTotalCartPrice(cart);
  await cart.save();
  res.status(201).json({
    status: "success",
    message: "product added to cart",
    data: cart,
  });
});
// get logged user cart
//privet / user
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ApiError(`this user not have cart shopping : `, 404));
  }
  res.status(200).json({
    status: "success",
    itemLength: cart.cartItems.length,
    data: cart,
  });
});
exports.deleteProductFromCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: {
        cartItems: { _id: req.params.id },
      },
    },
    { new: true },
  );

  if (!cart) {
    return next(new ApiError("Cart not found", 404));
  }

  calcTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Product deleted from cart",
    data: cart,
  });
});
//clear the cart user
exports.clearCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.status(200).json({
    status: "success",
  });
});
// update product quantity
exports.updateProductQuantity = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ApiError("Cart not found", 404));
  }
  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.id,
  );
  if (itemIndex > -1) {
    const productUpdate = cart.cartItems[itemIndex];
    productUpdate.quantity = req.body.quantity;
    cart.cartItems[itemIndex] = productUpdate;
  } else {
    return next(new ApiError("there is no item for this id ", 404));
  }
  calcTotalCartPrice(cart);

  await cart.save();
  res.status(200).json({
    status: "success",
    itemLength: cart.cartItems.length,
    data: cart,
  });
});


//apply coupon
exports.applyCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expireTime: { $gt: Date.now() },
  });
  if (!coupon) {
    return next(new ApiError("invalid coupon name or expire", 404));
  }
  const cart = await Cart.findOne({ user: req.user._id });
  let totalPrice = cart.totalPrice;
  let totalPriceAfterDiscount = (
    totalPrice -
    (totalPrice * coupon.discount) / 100
  ).toFixed(2);
  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
  await cart.save();
  res.status(200).json({
    status: "success",
    itemLength: cart.cartItems.length,
    data: cart
  });
});
