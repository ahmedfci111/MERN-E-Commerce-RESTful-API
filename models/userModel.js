const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "name required"],
    },
    slug: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      required: [true, "email reqiured"],
    },
    password: {
      type: String,

      required: [true, "password reqiured"],
    },
    passwordChangeAt: {
      type: Date,
    },
    profileImage: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "manger", "admin"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
    wishList: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    ],
    addresses: [
      {
        id: { type: mongoose.Schema.Types.ObjectId },
        alias: String,
        details: String,
        phone: String,
        city: String,
        postalCode: String,
      },
    ],
    passwordRestCode: String,
    passwordResetExpire: Date,
    passwordResetVerify: Boolean,
  },
  { timestamps: true },
);
const setImageUrl = (doc) => {
  if (doc.profileImage) {
    const imageUrl = `${process.env.BASE_URL}/profile/${doc.profileImage}`;
    doc.profileImage = imageUrl;
  }
};
userSchema.post("init", (doc) => {
  setImageUrl(doc);
});
userSchema.post("save", (doc) => {
  setImageUrl(doc);
});
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});
const User = mongoose.model("User", userSchema);
module.exports = User;
