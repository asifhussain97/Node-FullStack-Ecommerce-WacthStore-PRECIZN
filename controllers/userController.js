const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const Category = require("../models/category")
const Product = require("../models/product")
const message = require("../config/sms")
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
    res.render("registration");
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
    console.log( req.session.otp,'made',otp);
    const otpGeneratedTime = req.session.otpGeneratedTime;
    const currentTime = Date.now();

    console.log(otpGeneratedTime,'old time',currentTime);
    
    if (currentTime - otpGeneratedTime > 60 * 1000) {
      res.render("otp", {
        message: "OTP expired",
        otpGeneratedTime,
      });
      return;
    }
    if(req.session.otp==otp){
      const secure_password = await securePassword(userData.password);
      const user = new User({
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile,
        password: secure_password,
        is_admin: 0,
        is_blocked:0,
      })
      const userDataSave = await user.save();
      if(userDataSave){
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
  res.redirect('/verify')
  await message.sendVarifyMail(email, req);
}

// login user method
const loginLoad = async (req, res) => {
  try {
    res.render("login");
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

    const userData = await User.findById({ _id: req.session.user_id });
    const productData= await Product.find(); 
    res.render("home", { user: userData, products:productData  });
  } catch (error) {
    console.log(error.message);
  }
};

const userLogout = async (req, res) => {
  try {
    req.session.user_id=null ;
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

// user profile edit and update
const editLoad = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findById({ _id: id });
    if (userData) {
      res.render("edit", { user: userData });
    } else {
      res.redirect("/home");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const shop_details = async (req, res) => {
  try {

    const userData = await User.findById({ _id: req.session.user_id });
    // const id = req.query.id;
    const productData= await Product.find(); 
    const categoryData=await Category.find();
    res.render("shop", { user: userData, products:productData, category:categoryData});
  } catch (error) {
    console.log(error.message);
  }
};

const updateProfile = async (req, res) => {
  try {
    if (req.file) {
      const userData = await User.findByIdAndUpdate(
        { _id: req.body.user_id },
        {
          $set: {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mno,
            image: req.file.filename,
          },
        }
      );
    } else {
      const userData = await User.findByIdAndUpdate(
        { _id: req.body.user_id },
        {
          $set: {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mno,
          },
        }
      );
    }
    res.redirect("/home");
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
  userLogout,
  editLoad,
  shop_details,
  updateProfile,
  loadOtp,
  verifyOtp,
  resendOtp,
};
