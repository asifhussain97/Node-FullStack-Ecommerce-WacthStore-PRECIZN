const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const Category = require("../models/category")
const Product = require("../models/product")
const Address = require("../models/address")
const message = require("../config/sms")
const Wallet = require("../models/walletModel");
const Order = require("../models/orderModel");
var easyinvoice = require('easyinvoice');

let newUser;
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const loadRegister = async (req, res) => {
  try {
    referral = req.session.referralCode;
    console.log(referral,"referral");

    res.render("registration",referral);
  } catch (error) {
    console.log(error.message);
  }
};

const insertUser = async (req, res, next) => {
  try {
    newUser = {
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mno,
      password: req.body.password,
      password2: req.body.cpassword,
      is_admin: 0,
    }
    req.session.referralCode = req.body.referralCode || null;
    const referralCode = req.session.referralCode;
     // const existnumber = await User.findOne({ email: email });
     if (referralCode) {
      referrer = await User.findOne({ referralCode });

      if (!referrer) {
        res.render("registration", { errorMessage: "Invalid referral code." });
      }

      if (referrer.userReferred && referrer.userReferred.includes(req.body.email)) {
        res.render("registration", {
          errorMessage: "Referral code has already been used by this email.",
        });
      }
    }
    const existuser = await User.findOne({email:newUser.email})
    if (!newUser.name||!newUser.email||!newUser.mobile||!newUser.password||!newUser.password2
      ||/^[a-zA-Z ]+$/.test(newUser.name)==false
      ||/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(newUser.email)==false
      ||/^\d{10}$/.test(newUser.mobile)==false
      ||newUser.password.length <8
      ||newUser.password2!=newUser.password) {
      res.render('registration', { errorMessage: 'invalid entry' })

    } else if(existuser){
      res.render('registration', { errorMessage: 'this user already exists' })
    } else {
      req.session.userData = newUser;
      const email = req.session.userData.email;
      req.session.registerOtpVerify = 1;
      await message.sendVarifyMail(email, req);
      res.redirect('/verify')
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadOtp = async (req, res) => {
  try{
    const otpGeneratedTime = req.session.otpGeneratedTime;
    res.render("otp",{ otpGeneratedTime })
  } catch(error){
    console.log(error.message);
  }
}


const verifyOtp = async (req,res)=>{
  try{
    const otp= req.body.otp
    const userData = req.session.userData;
    const otpGeneratedTime = req.session.otpGeneratedTime;
    const currentTime = Date.now();

    
    if (currentTime - otpGeneratedTime > 80 * 1000) {
      res.render("otp", {
        errorMessage: "OTP expired",
        otpGeneratedTime,
      });
      return;
    }
    if(req.session.otp ==otp){
      const secure_password = await securePassword(userData.password);
      console.log('otp matchs');
      const user = new User({
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile,
        password: secure_password,
        is_admin: 0,
        is_blocked:0,
        userReferred:[],
      })
      const userDataSave = await user.save();
      if(userDataSave){
        req.session.registrationsuccess=true
        if (req.session.referralCode) {
console.log(userDataSave._id,'id');
        console.log(req.session.referralCode,'findinf wallet');
        
        const walletData = await Wallet.findOne({ user: userDataSave._id });
        if (walletData) {
          walletData.walletBalance +=50;
          walletData.transaction.push({
            type: "credit",
            amount:50,
          });
        
          await walletData.save(); 
        }else{
          const wallet = new Wallet({
            user: userDataSave._id,
            transaction:[{type:"credit",amount:50}],
            walletBalance:50,
          });
        await wallet.save();
        }
      
      
        const referrer = await User.findOne({
          referralCode: req.session.referralCode,
        });
        const user = await User.findOne({ _id: userDataSave._id });
        console.log(user,'user');

        referrer.userReferred.push(user.email);
        let gets = await referrer.save();
        console.log(gets,'got');
        const walletrefer = await Wallet.findOne({ user: referrer._id });

          if (walletrefer) {
            walletrefer.walletBalance +=100;
            walletrefer.transaction.push({
              type: "credit",
              amount:100,
            });
          
            await walletrefer.save(); 
          }else{
            const wallet = new Wallet({
              user: referrer._id,
              transaction:[{type:"credit",amount:100}],
              walletBalance:100,
          });
          await wallet.save();
          }
          delete req.session.referralCode;

        }
        res.redirect('/login')
      } else{
        res.render("register", { errorMessage: "Registration Failed" });
      }
    } else{
      res.render("otp", { errorMessage: "The OTP is incorrect" });
    }
  } catch(error){
    console.log(error.message)
  }
}

const resendOtp = async (req, res) => {
  const userData = req.session.userData;
  const email = userData.email;
  await message.sendVarifyMail(email, req);
  res.redirect('/verify')
}

// login user method
const loginLoad = async (req, res) => {
  try {
    if(req.session.registrationsuccess){
      res.render("login", {successmessage: "Registration Successful"});
      req.session.registrationsuccess=false
    }
    else{
      res.render("login");
    }
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
      if (passwordMatch && userData.is_admin == 0) {
        req.session.user_id = userData._id;
        res.status(303).redirect("/home");
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

const loadHome = async (req, res) => {
  try {
    if (!req.session.user_id) {
      const productData = await Product.find(); 
      res.render("home", { products: productData, user: null });
    } else {
      const userData = await User.findById({ _id: req.session.user_id });
      const productData = await Product.find(); 
      res.render("home", { user: userData, products: productData });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const userLogout = async (req, res) => {
  try {
    // Delete the user_id property from the session
    delete req.session.user_id;

    // Redirect the user after removing the user_id from the session
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

const shop_details = async (req, res) => {
  try {
    if(!req.session.user_id){
      const productData= await Product.find(); 
      const categoryData=await Category.find();
      res.render("shop", { user: null,products:productData, category:categoryData});
    }
    else{
      const userData = await User.findById({ _id: req.session.user_id });
      // const id = req.query.id;
      const productData= await Product.find(); 
      const categoryData=await Category.find();
      res.render("shop", { user: userData,products:productData, category:categoryData});
    }
  } catch (error) {
    console.log(error.message);
  }
};

const filter_product = async (req, res) => {
  try {
      const productData= await Product.find(); 
      const categoryData=await Category.find();

      const { subcategory, priceRange } = req.body;

      let filterCriteria = {};

      if (subcategory && priceRange) {
        filterCriteria = {
          sub_category: subcategory,
          price: { $gte: parseInt(priceRange.split('_')[0]), $lte: parseInt(priceRange.split('_')[1]) }
        };
      } else if (subcategory) {
        filterCriteria = { sub_category: subcategory };
      } else if (priceRange) {
        filterCriteria = {
          price: { $gte: parseInt(priceRange.split('_')[0]), $lte: parseInt(priceRange.split('_')[1]) }
        };
      } else {
        return res.status(400).json({ message: 'Please select at least one filter option' });
      }

      

      const filteredProducts = await Product.find(filterCriteria);
      console.log('done');
      res.status(200).json({ filteredProducts });
  } catch (error) {
    console.log(error.message);
  }
}

const loadProfile  = async (req, res) => {
  try{
    let walletData=null
    const userData = await User.findById({ _id: req.session.user_id });
    walletData = await Wallet.findOne({ user: req.session.user_id });
    const productData = await Product.find(); 
    const addressData = await Address.find();
    if(walletData){
      res.render("userdetails", { user: userData, products: productData, address:addressData, wallet:walletData });
    }
    else{
      res.render("userdetails", { user: userData, products: productData, address:addressData, wallet:walletData });
    }
  } catch (error) {
    console.log(error);
  }
}

const updateUserProfilepic = async (req, res) => {
  try{
    const userData = await User.findById({ _id: req.session.user_id });
    const productData = await Product.find(); 
    const addressData = await Address.find();
    
    const croppedImage = req.file.filename;
    
    await User.findByIdAndUpdate({ _id: userData.id },{
      $set: {
        image: croppedImage,
      },
    })
    res.status(200).json({ success: true, message: 'Profile Picture changed' });
  } catch (error) {
    console.log(error);
  }
}

// user profile edit and update
const loadEditUserdetails = async (req, res) => {
  try {
    const userId = req.session.user_id
    const userData = await User.findById({ _id: userId });
    if (userData) {
      res.status(200).json({
        success: true,
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile
        // Add other fields you need
      });    
    } else {
      res.status(404).json({ success: false, message: 'User details not found' });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const UpdateEditUserdetails = async (req, res) => {
  try {
      const userId = req.session.user_id;
      const userData = await User.findById(userId); // Changed from { _id: userId }
      console.log(req.body,"full");
      if (userData) {
          const updatedUserData = await User.findByIdAndUpdate(
              userId, // Changed from { _id: req.body.user_id }
              {
                  $set: {
                      name: req.body.editName,
                      email: req.body.email,
                      mobile: req.body.editMobile, // Corrected to match the frontend variable name
                  },
              },
              { new: true } // Added { new: true } to return updated data
          );

          res.status(200).json({ success: true, message: 'User details updated successfully', data: updatedUserData });
      } else {
          res.status(404).json({ success: false, message: 'Error occurred while editing' });
      }
  } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const changepassword = async (req, res) => {
  try {
    const userId = req.session.user_id;

    // Assuming you receive the current password, new password, and confirm password in the request body
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findById({_id:userId})
    const passwordMatch = await bcrypt.compare(currentPassword,user.password)
    console.log(passwordMatch)
    if(!passwordMatch){

      res.status(200).json({ success: false, message: 'The old password entered is incorrect' });

    }
    else if(newPassword!=confirmPassword){
      res.status(200).json({ success: false, message: 'Passwords does not match' });
    }
    else{
        const secure_password = await securePassword(newPassword)

        const updateData = await User.findByIdAndUpdate({_id:userId},{$set:{password:secure_password}})
        if(updateData){
          res.status(200).json({ success: true, message: 'Password has been updated' });
        }
    }
    
    } catch (error) {
      console.error("Error changing password:", error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// const loadInvoice = async(req,res)=>{
//   try {
//       const orderId = req.query.orderId;
//       const userId = req.session.user_id;

//       let order = await Order.findById(orderId).populate({path:"items.product"});
//       const address = order.address  
//       const user = await User.findById(userId);

//       res.render('invoice',{title:'Invoice',order,address,user,username:user.name});
//   } catch (error) {
//       console.log(error);
//   }
// }
const loadInvoice = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const orderId = req.params.id;
    const userData = await User.findById(userId);
    const order = await Order.findById(orderId)
      .populate("user")
      .populate({
        path: "address",
        model: "Address",
      })
      .populate({
        path: "items.product",
        model: "Product",
      });

    res.render("invoice2", { user:userData, order });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadRegister,
  insertUser,
  loginLoad,
  verifyLogin,
  loadHome,
  loadProfile,
  userLogout,
  loadEditUserdetails,
  shop_details,
  filter_product,
  updateUserProfilepic,
  UpdateEditUserdetails,
  changepassword,
  loadOtp,
  verifyOtp,
  resendOtp,
  loadInvoice,
};
