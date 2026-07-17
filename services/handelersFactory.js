const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const ApiFeatures = require("../utils/apiFeatuers");

// ====================== Create ======================
exports.createOne = (model) =>
  asyncHandler(async (req, res) => {
    const document = await model.create(req.body);
    console.log(req.file);
    console.log(req.body);
    res.status(201).json({
      status: "success",
      data: document,
    });
  });

// ====================== Get One ======================
exports.getOne = (model, populateOptions) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    let query = model.findById(id);

    if (populateOptions) {
      query = query.populate(populateOptions);
    }

    const document = await query;

    if (!document) {
      return next(new ApiError(`Can not find document by id: ${id}`, 404));
    }

    res.status(200).json({
      status: "success",
      data: document,
    });
  });

// ====================== Get All ======================
exports.getAll = (model, populateOptions) =>
  asyncHandler(async (req, res, next) => {
    let filter = {};

    if (req.filterObj) {
      filter = req.filterObj;
    }

    const countDocuments = await model.countDocuments(filter);

    const apiFeatures = new ApiFeatures(model.find(filter), req.query)
      .filter()
      .search(model.searchFields || [])
      .sort()
      .limit()
      .pagenation(countDocuments);

    if (populateOptions) {
      apiFeatures.mongooseQuery =
        apiFeatures.mongooseQuery.populate(populateOptions);
    }

    const documents = await apiFeatures.mongooseQuery;

    res.status(200).json({
      status: "success",
      results: documents.length,
      pagenationResult: apiFeatures.pagenationResult,
      data: documents,
    });
  });

// ====================== Update ======================
exports.updateOne = (model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const document = await model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!document) {
      return next(new ApiError(`Can not find document by id: ${id}`, 404));
    }
    document.save();
    res.status(200).json({
      status: "success",
      data: document,
    });
  });

// ====================== Delete ======================
exports.deleteOne = (model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const document = await model.findByIdAndDelete(id);

    if (!document) {
      return next(new ApiError(`Can not find document by id: ${id}`, 404));
    }
    document.remove();
    res.status(200).json({
      status: "success",
      message: "Document deleted successfully",
    });
  });
