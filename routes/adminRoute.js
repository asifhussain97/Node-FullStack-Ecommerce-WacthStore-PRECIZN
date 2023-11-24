const express = require("express");
const admin_route = express();
const session = require("express-session");
const config = require("../config/config");
// const bodyParser = require("body-parser");
const adminController = require("../controllers/adminController");
const categoryController = require("../controllers/categoryController");
const productController = require("../controllers/productController");
const auth = require("../middleware/adminAuth");
const multer = require("../middleware/multer");
// admin_route.use(express.json());
// admin_route.use(express.urlencoded({ extended: true }));

// admin_route.set("view engine", "ejs");
admin_route.set("views", "./views/admin");


// admin_route.use(session({ 
//   secret: config.sessionSecret,
//   resave: false,
//   saveUninitialized: true,
// }));

admin_route.get("/", auth.isLogout, adminController.loadLogin);
admin_route.post("/", adminController.verifyLogin);
admin_route.get("/home", auth.isLogin, adminController.loadDashboard);

admin_route.get("/category", auth.isLogin, categoryController.loadCategory);
admin_route.get("/addCategory", auth.isLogin, categoryController.addCategoryform);
admin_route.post("/addCategory", multer.uploadCategory.single("image"),categoryController.addCategory);
admin_route.get("/edit-category", auth.isLogin, categoryController.editCategoryLoad);
admin_route.post("/edit-category",multer.uploadCategory.single("image"), categoryController.updateCategory);
admin_route.get("/delete-add_category", categoryController.deleteAndaddCategory);

admin_route.get("/product", auth.isLogin, productController.loadProduct);
admin_route.get("/addProduct", auth.isLogin, productController.addProductform);
admin_route.post("/addProduct",multer.uploadProduct.array('image'),productController.addProduct);
admin_route.get("/edit-product", auth.isLogin, productController.editProductLoad);
admin_route.post("/edit-product",multer.uploadProduct.array("image"), productController.updateProduct);
admin_route.get("/delete-add_product", productController.deleteAndaddProduct);



admin_route.get("/userManage", auth.isLogin, adminController.loadUsermanage);
admin_route.get("/block-unblock_user", adminController.blockAndunblockUser);

admin_route.get("/logout", auth.isLogin, adminController.logout);
admin_route.get("/dashboard", auth.isLogin, adminController.adminDashboard);

admin_route.get("*", (req, res) => {
  res.redirect("/admin");
});

module.exports = admin_route;
