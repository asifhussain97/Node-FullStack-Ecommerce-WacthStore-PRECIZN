const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({

name:{
    type:String,
    required:true
},
email:{
    type:String,
    required:true,
   
},
mobile:{
    type:Number,
    required:true
},
password:{
    type:String,
    required:true
},
image:{
    type:String
},
is_admin:{
    type:Number,
    required:true
},
is_blocked:{
    type:Number,
    default:0
},
walletBalance: {
    type: Number,
    default: 0,
  },
referralCode: {
    type: String,
    default: RandomReferralCode,
    unique: true, 
},
userReferred: [{
    type: String,
}],

});

function RandomReferralCode() {

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const codeLength = 6;
    let referralCode = '';
    for (let i = 0; i < codeLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        referralCode += characters.charAt(randomIndex);
    }
    return referralCode;
    }

module.exports = mongoose.model("User",userSchema);
