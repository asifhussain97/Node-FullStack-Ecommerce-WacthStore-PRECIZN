const User = require("../models/userModel");
const Category = require("../models/category")
const Product = require("../models/product")
const Order = require("../models/orderModel");
const bcrypt = require("bcrypt");
const randomstring = require("randomstring");

const {
  getMonthlyDataArray,
  getDailyDataArray,
  getYearlyDataArray,
} = require("../config/chartData");
const loadAdminLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
 
  }
};

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
    let query = {};
    const adminData = await User.findById({ _id: req.session.admin_id });

    const totalRevenue = await Order.aggregate([
      { $match: {    "items.status": "Delivered"  } }, // Include the conditions directly
      { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } },
    ]);

    const totalUsers = await User.countDocuments({ is_blocked: 1});
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();
    const order = await Order.find().populate("user").limit(10).sort({ orderDate: -1 });

    const monthlyEarnings = await Order.aggregate([
      {
        $match: {
          "items.status": "Delivered" ,
          orderDate: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      },
      { $group: { _id: null, monthlyAmount: { $sum: "$totalAmount" } } },
    ]);

    const totalRevenueValue =
    totalRevenue.length > 0 ? totalRevenue[0].totalAmount : 0;
    const monthlyEarningsValue =
    monthlyEarnings.length > 0 ? monthlyEarnings[0].monthlyAmount : 0;

    const newUsers = await User.find({ is_blocked: 1,isAdmin:0  })
      .sort({ date: -1 })
      .limit(5);

      // Get monthly data
      const monthlyDataArray = await getMonthlyDataArray();

      // Get daily data
      const dailyDataArray = await getDailyDataArray();
    
      // Get yearly data
      const yearlyDataArray = await getYearlyDataArray();

    const monthlyOrderCounts= monthlyDataArray.map((item) => item.count)
  
    const dailyOrderCounts= dailyDataArray.map((item) => item.count)

    const yearlyOrderCounts= yearlyDataArray.map((item) => item.count)

    res.render("home", { 
      admin: adminData,
      totalRevenue:totalRevenueValue,
      totalOrders,
      totalCategories,
      totalProducts,
      totalUsers,
      newUsers,
      order,
      monthlyEarningsValue,
      monthlyOrderCounts,
      dailyOrderCounts,
      yearlyOrderCounts,
    });
  } catch (error) {
    console.log(error.message);
    // Handle errors appropriately
  }
};








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
