const express = require("express");
const user_route = express();
const multer = require("../middleware/multer");
const flash = require('connect-flash');
const auth = require("../middleware/auth");
const userController = require("../controllers/userController");
const productController = require("../controllers/productController");
const addressController = require("../controllers/addressController");
const cartController = require("../controllers/cartController");
const orderController=require('../controllers/orderController')


user_route.set("views", "./views/users");     

//  registeration
user_route.get("/register", auth.isLogout, userController.loadRegister);
user_route.post("/register", userController.insertUser);

user_route.get("/verify", userController.loadOtp);
user_route.post("/verify", userController.verifyOtp);
user_route.get("/resendotp", userController.resendOtp);

//login
user_route.get("/", auth.isLogout, userController.loadHome);
user_route.get("/login", auth.isLogout, userController.loginLoad);
user_route.post("/login", userController.verifyLogin);
user_route.get("/home", auth.isLogin, userController.loadHome);
user_route.get("/logout", auth.isLogin, userController.userLogout);
user_route.get('/forgotPassword',userController.loadForgetpassword );
user_route.post('/forgotpassword',userController.forgotPasswordOTP );
user_route.get('/resetPassword',userController.loadResetPassword );
user_route.post('/resetPassword',userController.changepassword );

// user
user_route.get("/product-details", productController.product_details);
user_route.get("/shop",userController.shop_details);
user_route.post("/filter",userController.filter_product);
user_route.get("/profile", auth.isLogin, userController.loadProfile);
user_route.post("/addressadd", addressController.addAddress);
user_route.get("/fetchAddress", auth.isLogin, addressController.loadEditAddress);
user_route.put("/addressedit", addressController.updateAddress);
user_route.delete("/deleteAddress", addressController.deleteAddress);
user_route.post("/updateProfile",multer.uploadProfilePic.single("croppedImage"), userController.updateUserProfilepic); 
user_route.get("/fetchUserDetails", auth.isLogin, userController.loadEditUserdetails); 
user_route.put("/updateUserDetails", userController.UpdateEditUserdetails);
user_route.post("/changePassword", auth.isLogin, userController.changepassword); 

// Cart
user_route.get('/cart',cartController.loadCartPage );
user_route.post('/cart',cartController.addTocart );
user_route.put("/updateCart", cartController.updateCartCount);
user_route.delete("/removeCartItem", cartController.removeFromCart);

//order
user_route.get('/checkout',orderController.loadCheckout );
user_route.post('/checkout',orderController.checkOutPost );
user_route.post('/razorpayOrder',orderController.razorpayOrder );
user_route.get('/orderSuccess',orderController.loadOrderDetails );
user_route.get('/orderDetails/:id',orderController.loadOrderHistory );
user_route.post('/orderCancel',orderController.orderCancel );
user_route.post('/return',orderController.returnapprove );
user_route.get('/invoice/:id',userController.loadInvoice );



user_route.post('/applyCoupon',orderController.applyCoupon)

module.exports = user_route;


