const multer = require('multer');
const path = require('path');
const uuid = require('uuid'); // Import the uuid library

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      
      cb(null, 'public/assets/img/category');
    },
    filename: function (req, file, cb) {
      const fileName = Date.now() + path.extname(file.originalname);
      cb(null, fileName);
    }
  });
const storeproductIMG = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/assets/img/product');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + uuid.v4(); // Append a unique identifier
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const storageuserIMG = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/assets/img/profilepic');
  },
  filename: function (req, file, cb) {
    const fileExt = path.extname(file.originalname);
    const uniqueFileName = uuid.v4() + fileExt; // Use uuid to generate a unique filename with the original extension
    cb(null, uniqueFileName);
  }
});


  module.exports = {
    uploadCategory: multer({ storage: storage }),
    uploadProduct:multer({ storage: storeproductIMG }),
    uploadProfilePic:multer({ storage:storageuserIMG})
  }

