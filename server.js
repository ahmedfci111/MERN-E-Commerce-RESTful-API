const path = require("path");
const express = require("express");
const ApiError = require("./utils/ApiError");
const globelErrors = require("./middleWares/globelErrors");
const dotenv = require("dotenv").config({ path: [".env.local", ".env"] });
const morgan = require("morgan");
const dbConnection = require("./config/dbConnection");
const cors = require("cors");
const compression = require("compression");
const { mountRoute } = require("./routes/mountRouts");
const { webHookCheckout } = require("./services/orderServies");

const app = express();
//all ui can use my app
app.use(cors());

// compression all response
app.use(compression());
// db connection
dbConnection();

//use medallware
if (process.env.NODE_ENV) {
  app.use(morgan("dev"));
  console.log(`mode : ${process.env.NODE_ENV}`);
}
//parsing to json
app.use(express.json());
app.set("query parser", "extended");
app.use(express.static(path.join(__dirname, "uploads")));
//routing
app.get("/", (req, res) => {
  res.send("run app v1");
});
//webhook route
// The express.raw middleware keeps the request body unparsed;
// this is necessary for the signature verification process
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  webHookCheckout,
);

//use mounten Rouet
mountRoute(app);

// handel route * not found
app.use((req, res, next) => {
  next(new ApiError(`Can not find this route >> ${req.originalUrl}`, 400));
});
// handel globel error
app.use(globelErrors);

//run server
const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  console.log(`app run on port ${PORT}`);
});

// handel a globel error out express

process.on("unhandledRejection", (err) => {
  console.error(`unhandledRejection Error :::  ${err.name}`);
  server.close(() => {
    console.log("server shut down ....");
    process.exit(1);
  });
});
