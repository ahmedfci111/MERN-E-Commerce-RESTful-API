const ApiError = require("../utils/ApiError");
const multer = require("multer");

const multerOptions = () => {
  const multerStorage = multer.memoryStorage();
  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError(`Can not upload this file >>> images only`, 404), false);
    }
  };

  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
  return upload;
};

// upload single image middleware
exports.uploadSingleImage = (fieldName) => {
  // use memory storage
  return multerOptions().single(fieldName);
};
// upload images
exports.uploadImages = (arrayOfFields) => {
  return multerOptions().fields(arrayOfFields);
};
