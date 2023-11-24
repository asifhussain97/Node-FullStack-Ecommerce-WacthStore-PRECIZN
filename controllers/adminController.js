const User = require("../models/userModel");
const Category = require("../models/category")
const Product = require("../models/product")
const bcrypt = require("bcrypt");
const randomstring = require("randomstring");
// const { map } = require("../routes/adminRoute");


const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const loadLogin = async (req, res) => {
  try {
    res.render("login");
    /* res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private"
    ); */
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });
    if(!email||!password){
      res.render("login", {message: "Please enter both email and password"});
    } else if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch && userData.is_admin==1) {
        req.session.admin_id = userData._id;
        res.redirect("/admin/home");
      } else {
        res.render("login", { message: "Email and password is incorrect" });
      }
    } else {
      res.render("login", { message: "Email and password is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadDashboard = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.admin_id });
    res.render("home", { admin: userData });
  } catch (error) {
    console.log(error.message);
  }
};




// const updateProduct = async (req, res) => {
//   try {
//     console.log(req.files,'fiule')
//     const product = await Product.findById({ _id: req.body.id });
//     console.log(product)
//     if (req.body.singleImage) {
//       const updatedImageIndex = req.body.imageIndexToUpdate; // Index of the image to update
//       product.image[updatedImageIndex] = req.body.singleImage; // Update the specific image
//     } else {
//       const images = [];
//       for (let i = 0; i < req.files.length; i++) {
//         images.push(req.files[i].filename);
//       }
//       product.image = images;
//     }
//     // Update other fields
//     product.name = req.body.name || product.name;
//     product.description = req.body.description || product.description;
//     product.category = req.body.category || product.category;
//     product.price = req.body.price || product.price;
//     product.discount_price = req.body.discount_price || product.discount_price;
//     product.stock = req.body.stock || product.stock;
//     product.productColor = req.body.productColor || product.productColor;
//     product.gender = req.body.gender || product.gender;

//     await product.save(); // Save the updated product data

//     res.redirect('/admin/edit-product');
//   } catch (error) {
//     console.log(error.message);
//   }
// };





const loadUsermanage = async(req,res)=>{
  try{
    const userData = await User.findById({ _id: req.session.admin_id });  
      const usermanageData= await User.find();
      res.render('userManagment', { admin: userData, user: usermanageData });
  } catch (error) {
    console.log(error.message);
  }
}

const blockAndunblockUser = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findById(id)
    if(userData.is_blocked==0){
      await User.updateOne(
        { _id: id },
        {
          $set: {
            is_blocked: 1
          },
        }
      );
      res.status(200).json({ success: true, message: 'User blocked' });

    }
    else{
      await User.updateOne(
        { _id: id },
        {
          $set: {
            is_blocked: 0
          },
        }
      );
      res.status(200).json({ success: true, message: 'User unblocked' });
    }
    // res.redirect("/admin/userManage");
  } catch (error) {
    res.status(500).json({ success: false, message: 'Operation failed' });

  }
};


const logout = async (req, res) => {
  try {
    req.session.admin_id=null;
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

const adminDashboard = async (req, res) => {
  try {
    const usersData = await User.find({ is_admin: 0 });
    res.render("dashboard", { users: usersData });
  } catch (error) {
    console.log(error.message);
  }
}; 



//edit user functionality




module.exports = {
  loadLogin,
  verifyLogin,
  loadDashboard,
  loadUsermanage,
  blockAndunblockUser,
  logout,
  adminDashboard,
};
