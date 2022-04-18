const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const authRoutes = require("./auth/routes");
const postRoutes = require("./posts/routes");

var app = express();

// middleware
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("tiny"));

app.set("port", process.env.PORT);

app.use("/auth", authRoutes);
app.use("/posts", postRoutes);

mongoose.connect(
  process.env.DB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) throw err;
    console.log("server connected to mongo successfully");
  }
);

app.listen(app.get("port"), () => {
  /* eslint-disable no-console */
  console.log("server is running on port " + app.get("port"));
  /* eslint-enable no-console */
});
