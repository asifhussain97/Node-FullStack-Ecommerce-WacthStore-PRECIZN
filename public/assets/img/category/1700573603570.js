const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/e-commerce");
const express = require("express");

const path = require("path");
const app = express();

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store"," no-cache", "must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//static
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public/assets")));

// for user route
const userRoute = require("./routes/userRoute");
app.use("/", userRoute);

//for admin route
const adminRoute = require("./routes/adminRoute");
app.use("/admin", adminRoute);

app.listen(4000, function () {
  console.log(
    "Server is running...Registration Page at http://localhost:4000/register"
  );
});
