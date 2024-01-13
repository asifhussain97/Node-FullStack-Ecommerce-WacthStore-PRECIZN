const mongoose = require('mongoose');

const Product = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: [{
    type: String,
    required: true
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  sub_category: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true
  },
  discount_price: {
    type: Number,
    required: true
  },
  discountPrice: {
    type: Number,
  },
  discountStatus:{
    type:Boolean,
    default:false
  },
  discount:Number,
  discountStart:Date,
  discountEnd:Date,
  stock: {
    type: Number,
    required: true
  },
  productColor: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  is_listed: {
    type: Boolean,
    default: true
  },
  productAddDate: {
    type: Date,
    default: Date.now, // Store the current date and time when the user is created
  },
});
module.exports = mongoose.model('Product', Product);


//   brand:{
//     type:String,
//     required:true
// },