const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const cookieParser = require('cookie-parser');

const authRoutes = require("./auth/routes");
const postRoutes = require("./posts/routes");

var app = express();

global.access_token = null;

// middleware
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("tiny"));
app.use(cookieParser());

app.set("port", process.env.PORT);

app.use("/auth", authRoutes);
app.use("/posts", postRoutes);

mongoose.connect(
  process.env.DB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) throw err;
    console.log("Server connected to mongo successfully");
  }
);

app.listen(app.get("port"), () => {
  /* eslint-disable no-console */
  console.log(
    "Server is running on port " +
      app.get("port") +
      " in " +
      process.env.NODE_ENV +
      " mode."
  );
  /* eslint-enable no-console */
});
