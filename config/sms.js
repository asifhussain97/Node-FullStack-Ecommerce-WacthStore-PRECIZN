const nodemailer = require('nodemailer')
require('dotenv').config(); // Load environment variables from .env file

  const sendVarifyMail = async (email,req) => {
    try {
 
      const otp = generateOTP(4); 
   
      req.session.otp = otp;
      req.session.otpGeneratedTime = Date.now();
      const transporter = nodemailer.createTransport({
  
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.USER_EMAIL,
          pass: process.env.USER_PASSWORD,
        },
      });
      const mailOptions = {
        from: 'chillus8606@gmail.com',
        to: email,
        subject: 'For verification purpose',
        html: `<p>Hello , please enter this OTP: <strong>${otp}</strong> to verify your email.</p>`,
      };
       const information=await  transporter.sendMail( mailOptions);
       
    } catch (error) {
      console.log(error);
    }
  };

  function generateOTP(length) {
      const characters = '0123456789'; // The characters to use for the OTP
      let otp = '';
    
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        otp += characters[randomIndex];
      }
    
      return otp;
    }
  module.exports= {
  
    sendVarifyMail,
 
  }
