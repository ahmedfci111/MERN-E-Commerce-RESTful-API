const mongoose = require("mongoose");
//create schema sub category
const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subcategory name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "subcategory must be belong to parent category"],
    },
  },
  { timestamps: true },
);
subCategorySchema.statics.searchFields = ["name"];
const SubCategory = mongoose.model("subCategory", subCategorySchema);



module.exports = SubCategory;
