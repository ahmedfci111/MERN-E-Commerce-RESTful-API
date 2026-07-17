
const subCategory = require("../models/subCategoryModel");

const factory = require("./handelersFactory");
//nasted route to set id
exports.setCategoyId = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};
//nased routes to get by filter obj
exports.createFilterObj = (req,res,next)=>{
  let filterObj = {};
  if(req.params.categoryId)filterObj ={category:req.params.categoryId}
  req.filterObj =filterObj ;
  next();
}

// get all sub categories
exports.getSubCategories = factory.getAll(subCategory, {
  path: "category",
  select: "name",
})
// get sub by id
exports.getSubCategory = factory.getOne(subCategory,  {
  path: "category",
  select: "name",
})
// create sub category
exports.createSubCategory = factory.createOne(subCategory);
//update sub category and category
exports.updateSubcategory = factory.updateOne(subCategory);
//delete category
exports.deleteSubCategory = factory.deleteOne(subCategory);
