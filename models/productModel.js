const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "title must be required"],
      minLength: [3, "length of title too short"],
      maxLength: [100, "length of title tii long"],
    },
    description: {
      type: String,
      required: [true, "desc nust be required"],
      minLength: [32, "length of desc too short"],
    },
    slug: {
      type: String,
    },
    quantity: {
      type: Number,
      default: 1,
      required: [true, "quantity must be reqierd"],
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "price must be required"],
      min: [2],
    },
    priceAfterDiscount: {
      type: Number,
    },
    coverImage: {
      type: String,
      required: [true, "cover image must be required"],
    },
    images: [String],
    ratingsAverage: {
      type: Number,
      min: [1, "rating start 1"],
      max: [5, "rating end 5"],
      default: 0,
    },
    ratingsQuantity: {
      type: Number,

      default: 0,
    },
    colors: [String],
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "product must be belong to  category"],
    },
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: "Brand",
    },
    subCategories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "subCategory",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
productSchema.statics.searchFields = ["title", "description"];
const setImageUrl = (doc) => {
  if (doc.coverImage) {
    const imageUrl = `${process.env.BASE_URL}/product/${doc.coverImage}`;
    doc.coverImage = imageUrl;
  }
  if (doc.images) {
    const imagesArr = [];
    doc.images.forEach((img) => {
      const imageUrl = `${process.env.BASE_URL}/product/${img}`;
      imagesArr.push(imageUrl);
    });
    doc.images = imagesArr;
  }
};
productSchema.post("init", (doc) => {
  setImageUrl(doc);
});
productSchema.post("save", (doc) => {
  setImageUrl(doc);
});
///
productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id"
});
module.exports = mongoose.model("Product", productSchema);
