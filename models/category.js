const mongoose = require("mongoose");

const Category= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    sub_category:[{
        type: String,
        required: true
    }],
    image:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    is_listed:{
        type:Boolean,
        defalut:true
    },
    categoryAddDate: {
        type: Date,
        default: Date.now, // Store the current date and time when the user is created
    },
});
module.exports=mongoose.model("Category",Category)