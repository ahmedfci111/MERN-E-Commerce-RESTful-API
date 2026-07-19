const path = require("path");
const express = require("express");
const ApiError = require("./utils/ApiError");
const globelErrors = require("./middleWares/globelErrors");
const dotenv = require("dotenv").config({ path: [".env.local", ".env"] });
const morgan = require("morgan");
const dbConnection = require("./config/dbConnection");
const cors = require("cors");
const compression = require("compression");
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const helmet = require("helmet");
const { rateLimit, MINUTE } =require ('express-rate-limit')
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
//webhook route
// The express.raw middleware keeps the request body unparsed;
// this is necessary for the signature verification process
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  webHookCheckout,
);

//parsing to json
app.use(express.json({ limit: "1kb" }));
app.set("query parser", "extended");
app.use(express.static(path.join(__dirname, "uploads")));
//routing
app.get("/", (req, res) => {
  res.send("run app v1");
});
app.use(helmet());               // حماية الـ HTTP Headers
//secuirty section
app.use(mongoSanitize());
const limiter = rateLimit({
	windowMs: 60 * MINUTE, // SECOND, MINUTE, HOUR, and DAY constants are available, or a use bare number for milliseconds
	limit: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
	// store: ... , // Redis, Memcached, etc. See below.
  message: { error: 'Too many requests, please try again later.' },
})

// Apply the rate limiting middleware to all requests.
app.use('/api/v1/Auth/forgetPassword',limiter)
app.use(hpp({ whitelist: [ 'price','sold','quantity','ratingsAverage','ratingsQuantity' ] })); // <- THIS IS THE NEW LINE for hpp 
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
