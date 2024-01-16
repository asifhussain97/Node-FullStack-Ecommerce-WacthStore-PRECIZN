const mongoose = require("mongoose")

const addressSchema = new mongoose.Schema({

  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
  },
  houseName:{
    type:String,
    required:true
  },
  street:{
    type:String,
    required:true
  },
  city:{
    type:String,
    required:true
  },
  state:{
    type:String,
    required:true
  },
  pincode:{
    type:String,
    required:true
  },
  Date:{
    type:Date,
    default:Date.now
  },
  is_default:{
    type:Boolean,
    default:false
  },
  is_listed:{
    type:Boolean,
    default:true
  }
})

module.exports = mongoose.model("Address",addressSchema)