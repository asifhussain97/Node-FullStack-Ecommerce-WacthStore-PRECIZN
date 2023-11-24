const express = require("express");
const user_route = express();
const multer = require("multer");
const flash = require('connect-flash');
const auth = require("../middleware/auth");
const userController = require("../controllers/userController");
const productController = require("../controllers/productController");

// user_route.use(
//   session({
//     secret: config.sessionSecret,
//     resave: false,
//     saveUninitialized: true,
//   })
// );

/* const storage = multer.diskStorage({
    destination:function(req,res,cb){
        cb(null,path.join(__dirname,'../public/userImages'));
    },
    filename:function(req,file,cb){
        const name =Date.now()+'-'+file.originalname;
        cb(null,name);
    }
})

const upload = multer({storage:storage}); */

// user_route.use(express.json());
// user_route.use(express.urlencoded({ extended: true }));
// user_route.use(flash());
// user_route.set("view engine", "ejs");

user_route.set("views", "./views/users");     

user_route.get("/register", auth.isLogout, userController.loadRegister);
user_route.post("/register", userController.insertUser);

user_route.get("/verify", auth.isLogout, userController.loadOtp);
user_route.post("/verify", userController.verifyOtp);
user_route.get("/resendotp", auth.isLogout, userController.resendOtp);

user_route.get("/", auth.isLogout, userController.loginLoad);
user_route.get("/login", auth.isLogout, userController.loginLoad);
user_route.post("/login", userController.verifyLogin);
user_route.get("/home", auth.isLogin, userController.loadHome);

user_route.get("/product-details", auth.isLogin, productController.product_details);
user_route.get("/shop", auth.isLogin,userController.shop_details);

user_route.get("/logout", auth.isLogin, userController.userLogout);

user_route.get("/edit", auth.isLogin, userController.editLoad);

user_route.post("/edit", userController.updateProfile);

module.exports = user_route;
