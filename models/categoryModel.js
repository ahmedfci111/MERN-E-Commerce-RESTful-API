const mongoose = require("mongoose");

//create schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,

      unique: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  { timestamps: true },
);
categorySchema.statics.searchFields = ["name"];
const setImageUrl = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/category/${doc.image}`;
    doc.image = imageUrl;
  }
};
categorySchema.post("init", (doc) => {
  setImageUrl(doc);
});
categorySchema.post("save", (doc) => {
  setImageUrl(doc);
});
//convert schema to model to use
const CategoryModel = mongoose.model("Category", categorySchema);

module.exports = CategoryModel;
