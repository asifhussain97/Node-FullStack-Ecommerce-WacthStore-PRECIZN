require('dotenv').config(); // Load environment variables first

const express = require("express");
const session = require('express-session');
const mongoose = require("mongoose");
const config = require("./config/config"); // Now require other modules after loading dotenv

mongoose.connect("mongodb://127.0.0.1:27017/e-commerce");

const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");

const path = require("path");
const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
  })
);

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//static
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public/assets/css")));
app.use(express.static(path.join(__dirname, "public/assets/js")));
app.use(express.static(path.join(__dirname, "public/assets/img")));

// for user route
app.use("/", userRoute);
//for admin route
app.use("/admin", adminRoute);

app.use((req, res, next) => {
  res.status(404).render("./layouts/404Error", { userData: null });
  next();
});


app.listen(5000, function () {
  console.log(
    "Server is running..."
  );
});
