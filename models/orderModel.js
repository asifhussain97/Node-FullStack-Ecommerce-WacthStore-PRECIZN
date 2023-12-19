const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  deliveryDate: {
    type: Date,
  },
  shipping:{
    type:String,
    default:'Free Shipping'
},
 

  totalAmount :{
    type:Number,
    require:true,
  },

 
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      quantity: Number,
      price: Number,
      status: {
        type: String,
        default: 'pending',
      },
      reason:{
        type:String
      },
      paymentMethod: {
        type:String,
        require:true,
      },
      paymentStatus:{
        type:String,
        default:'Pending'
      },
    },
  ],
});

module.exports = mongoose.model('Order', orderSchema);


