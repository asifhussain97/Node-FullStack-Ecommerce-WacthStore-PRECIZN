const Coupon=require('../models/coupenModel')
const User = require("../models/userModel");

const loadCouponAdd = async (req, res) => {
    try {
        const admin=req.session.admin_id
        res.render("couponAdd", { admin });
      
     
    } catch (error) {
      console.log(error.message);
    }
};

const addCoupon = async (req, res) => {
    try {
      const admin = req.session.admin_id;

      let {
        code,
        discount,
        limit,
        expiry,
        minAmt,
        maxAmt
      } = req.body;


      code = code.replace(/\s/g,"");
  
  
      const existingCoupon = await Coupon.findOne({
        code: { $regex: new RegExp("^" + code, "i") },
      });
  
      if (existingCoupon) {
        return res.status(206).json({ success: false, error: "Coupon code already exists" });
      }
  
      const newCoupon = new Coupon({
        code: code,
        discount: discount,
        limit: limit,
   
        expiry: expiry,
        maxAmt: maxAmt,
        minAmt: minAmt,
      });
  
  
      await newCoupon.save();
      res.status(200).json({ success: true, message: "Coupon added successfully" });
    } catch (error) {
      console.error(error); // Log the complete error object for detailed information
      res.status(500).json({ success: false, error: "Failed to add coupon" });
    }
  };

  const loadEditCoupon = async (req, res) => {
    try {
      const admin = req.session.admin_id;
      const couponId = req.query.couponId;
      const coupon = await Coupon.findById(couponId);
      const expiry = new Date(coupon.expiry).toISOString().split("T")[0];

      res.render("couponEdit", { admin, coupon,expiry });
    } catch (error) {
      console.log(error.message);
    }
  };

  const editCoupon = async (req, res) => {
    try {
        const couponId = req.query.couponId;

        let {
            code,
            discount,
            limit,
            minAmt,
            maxAmt,
        
            expiry
        } = req.body;

        if (!code || !discount || !expiry ) {
            return res.status(206).json({ success: false, error: "Required fields missing" });
        }

        const existingCoupon = await Coupon.findOne({
            code: { $regex: new RegExp("^" + code, "i") },
            _id: { $ne: couponId }
        });

        if (existingCoupon) {
            return res.status(206).json({ success: false, error: "Coupon code already exists" });
        }

        const updatedCoupon = await Coupon.findByIdAndUpdate(
            { _id: couponId },
            {
                $set: {
                    code: code,
                    discount: discount,
                    limit: limit,
              
                    expiry: expiry,
                    maxAmt: maxAmt,
                    minAmt: minAmt,
                },
            },
            { new: true } // To get the updated document
        );

        if (!updatedCoupon) {
            return res.status(404).json({ success: false, error: "Coupon not found" });
        }

        res.status(200).json({ success: true, message: "Coupon updated successfully", data: updatedCoupon });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, error: "Failed to update coupon" });
    }
};


// Function to load the coupon list
const loadCouponList = async (req, res) => {
    try {
        const admin = req.session.admin_id;

      const coupon = await Coupon.find().sort({ createdDate: -1 });

      res.render("couponList", { coupon, admin});
    } catch (error) {
      console.log(error.message);
    }
  };

  const deleteAndaddCoupon = async (req, res) => {
    try {
      const id = req.query.id;
      const couponData = await Coupon.findById(id);
  
      if (couponData.is_listed) {
        await Coupon.updateOne(
          { _id: id },
          {
            $set: {
              is_listed: false
            },
          }
        );
        res.status(200).json({ success: true, message: 'Coupon listed' });
      } else {
        await Coupon.updateOne(
          { _id: id },
          {
            $set: {
              is_listed: true
            },
          }
        );
        res.status(200).json({ success: true, message: 'Coupon unlisted' });
      }
  
    } catch (error) {
      res.status(500).json({ success: false, message: 'Operation failed' });
    }
  };

module.exports={
    loadCouponAdd,  
    addCoupon,
    loadCouponList,
    loadEditCoupon,
    editCoupon,
    deleteAndaddCoupon,
}