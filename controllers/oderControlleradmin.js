const Order = require("../models/orderModel");

  const Address = require("../models/address");
  const User = require("../models/userModel");
  const Cart = require("../models/cartModel");
  
  const Product = require("../models/product");
  const dateFun=require("../config/dateData")
  const Coupon=require('../models/coupenModel')
  const Wallet = require("../models/walletModel");

const listUserOrders = async (req, res) => {
    try {
      const admin = req.session.adminData;
  
    
  
      const orders = await Order.find()
        .populate("user")
        .populate({
          path: "address",
          model: "Address",
        })
        .populate({
          path: "items.product",
          model: "Product",
        })

      res.render("allOrder", { order:orders,admin });
    } catch (error) {
      console.log(error.message);
    }
  };
const listOrderDetails=async(req,res)=>{

        try {
          const admin = req.session.adminData;

          const orderId = req.query.id;
    
          const order = await Order.findById(orderId)
          .populate("user")
          .populate({
            path: "address",
            model: "Address",
          })
          .populate({
            path: "items.product",
            model: "Product",
          })
     console.log(order,"order");
      res.render("orderDetails", { order,admin });
        } catch (error) {
          console.log(error.message);
        }
}
const orderStatusChange = async (req, res) => {
    try {

      const orderId = req.query.id;
      const {status,productId}=req.body
     
      console.log('inside change');
      const admin = req.session.adminData;
 
   
 
      const order = await Order.findOne({ _id: orderId })
        .populate("user")
        .populate({
          path: "address",
          model: "Address",
        })
        .populate({
          path: "items.product",
          model: "Product",
        });
 
  console.log(order,"orderorder");



  const product = order.items.find(
    (item) => item.product._id.toString() === productId
  );

  if (product && status=='Delivered'){ 
    product.paymentStatus = 'success';
    product.approve = 'not set'
    product.status = status;
  } else if(product){
    product.status = status;
  }
   

  
  const updateData = await Order.findByIdAndUpdate(
    orderId,
    {
      $set: {
        items: order.items,
        
      },
    },
    { new: true }
  );
    
  

      return res.status(200).json({ success:true,message: "Order status change successfully" });
   
  
    } catch (error) {
      return res
      .status(500)
      .json({ error: "An error occurred while change status the order" });
  
    }
  }; 


//   const loadSalesReport =async(req,res)=>{


   
  
   
    
//     let query = { 'product.paymentStatus': "success" };

//     if (req.query.paymentMethod) {
//       if (req.query.paymentMethod === "onlinePayment") {
//         query.paymentMethod = "onlinePayment";
//       } else if (req.query.paymentMethod === "Wallet") {
//         query.paymentMethod = "Wallet";
//       } else if (req.query.paymentMethod === "CashOnDelivery") {
//         query.paymentMethod = "CashOnDelivery";
//       }
//     }
//     if (req.query.status) {
//       if (req.query.status === "Daily") {
//         query.orderDate = dateFun.getDailyDateRange();
//       } else if (req.query.status === "Weekly") {
//         query.orderDate = dateFun.getWeeklyDateRange();
//       }else if (req.query.status === "Monthly") {
//         query.orderDate = dateFun.getMonthlyDateRange();
//       } 
      
//       else if (req.query.status === "Yearly") {
//         query.orderDate = dateFun.getYearlyDateRange();
//       }
//       else if (req.query.status === "All") {
//         query.paymentStatus = "success";
//       }
//     }

//     const orders = await Order.find(query)
//     .populate("user")
//     .populate({
//       path: "address",
//       model: "Address",
//     })
//     .populate({
//       path: "items.product",
//       model: "Product",
//     })
//     .sort({ orderDate: -1 });
//     console.log(orders,"orders");
//  // total revenue
//  const totalRevenue = orders.reduce(
//   (acc, order) => acc + order.totalAmount,
//   0
// );


// // all returned orders

// const totalSales = orders.length;
//     // total Sold Products
//     const totalProductsSold = orders.reduce(
//       (acc, order) => acc + order.items.length,
//       0
//     );




//   res.render("admin/salesReport",{

//     orders,

//     totalRevenue,

//     totalSales,
//     totalProductsSold,
//     req
//   } );
//   }

const returnData =async (req, res)=>{
  try {
  
    const orderId = req.query.id;
    const { reason, productId } = req.body;
    const order = await Order.findOne({ _id: orderId })
      .populate("user")
      .populate({
        path: "address",
        model: "Address",
      })
      .populate({
        path: "items.product",
        model: "Product",
      });
      const couponData = await Coupon.findOne({ code: order.coupon });
  
    const user = order.user;
    let totalAmount = order.totalAmount;
    console.log(totalAmount, "totalAmount");
    const product = order.items.find(
      (item) => item.product._id.toString() === productId
    );
    
    if (product && product.product) {
     
      if (product.status === "Delivered") {
            product.stock += product.quantity;
        await product.product.save();
      }
  
    const walletData = await Wallet.findOne({ user: user });
    if (walletData) {
      walletData.walletBalance +=(product.price * product.quantity)- (product.price * product.quantity)*(couponData?.discount?couponData.discount:0)/100;
      walletData.transaction.push({
        type: "credit",
        amount:(product.price * product.quantity)- (product.price * product.quantity)*(couponData?.discount?couponData.discount:0)/100,
      });
    
      await walletData.save(); 
    }else{
      const wallet = new Wallet({
        user: user,
        transaction:[{type:"credit",amount: (product.price * product.quantity)- (product.price * product.quantity)*(couponData?.discount?couponData.discount:0)/100}],
        walletBalance:  (product.price * product.quantity)- (product.price * product.quantity)*(couponData?.discount?couponData.discount:0)/100,
    });
    await wallet.save();
    }
        product.status = "Returned";
        product.paymentStatus = "Refunded";
        product.approve = "approve";
        product.reason = reason;
        order.totalAmount =order.totalAmount-(product.price * product.quantity)- (product.price * product.quantity)*(couponData?.discount?couponData.discount:0)/100;
    
      }
    
      await order.save();
    
      res.status(200).json({ success: true, message: "return sucessfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while returning the order" });
    }
  };

const loadSalesReport = async (req, res) => {
  let query = {};

  
        if (req.query.status) {
          if (req.query.status === "Daily") {
            query.orderDate = dateFun.getDailyDateRange();
          } else if (req.query.status === "Weekly") {
            query.orderDate = dateFun.getWeeklyDateRange();
          }else if (req.query.status === "Monthly") {
            query.orderDate = dateFun.getMonthlyDateRange();
          } 
          
          else if (req.query.status === "Yearly") {
            query.orderDate = dateFun.getYearlyDateRange();
          }
          else if (req.query.status === "All") {
            query["items.status"] = "Delivered";
          }
        }
  query["items.status"] = "Delivered";

  try {
    const admin = req.session.adminData;

    const orders = await Order.find(query).sort({ orderDate: -1 } )
      .populate("user")
      .populate({
        path: "address",
        model: "Address",
      })
      .populate({
        path: "items.product",
        model: "Product",
      })
      .sort({ orderDate: -1 });

    // Calculate total revenue
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    // Calculate total sales count
    const totalSales = orders.length;

    // Calculate total products sold
    const totalProductsSold = orders.reduce((acc, order) => acc + order.items.length, 0);

    res.render("salesReport", {
      orders,
      totalRevenue,
      totalSales,
      totalProductsSold,
      req,
      admin,
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    // Handle error - send an error response or render an error page
    res.status(500).send("Error fetching orders");
  }
};


  const downloadPdf=()=>{
    const pdfPath = path.join(__dirname, 'path/to/your/pdf.pdf');

    // Read the PDF file
    fs.readFile(pdfPath, (err, data) => {
      if (err) {
        res.status(500).send('Error occurred while reading the PDF file.');
      } else {
        // Set headers to trigger a download prompt
        res.setHeader('Content-Disposition', 'attachment; filename="your_pdf_file.pdf"');
        res.setHeader('Content-Type', 'application/pdf');
  
        // Send the file as a response
        res.status(200).json({ success: true, data, message: "download sucessfully" });
      }
    });
  }

  const dateFilter = async (req, res) => {
    const start = req.params.start;
    const end = req.params.end;

    let query = {};

    if (start && end) {
        
        query.orderDate = { $gte:start,
        $lt:end };
    }
    // Include the filter for items.status
    query['items.status'] = 'Delivered';
    try {
        const orders = await Order.find(query)
            .populate("user")
            .populate({
                path: "address",
                model: "Address"
            })
            .populate({
                path: "items.product",
                model: "Product"
            })
            .sort({ orderDate: -1 });

            

        const totalRevanue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
        const totalSales = orders.length;
        const totalProductSold = orders.reduce((acc, order) => acc + order.items.length, 0);

        const filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.orderDate).toLocaleDateString();
            const deliveryDate = new Date(order.deliveryDate).toLocaleDateString();
        
            // Check if orderDate is greater than or equal to start
            // and deliveryDate is less than or equal to end
            return orderDate >= start && deliveryDate <= end;
        });
        

       

        res.status(200).json({ success: true, totalProductSold, totalSales, totalRevanue, orders, message: "return successfully" });

    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ success: false, error: "Error fetching orders" });
    }
};
  module.exports={
    listUserOrders,
    listOrderDetails,
    orderStatusChange,
    loadSalesReport,
    downloadPdf,
    dateFilter,
    returnData,
  }