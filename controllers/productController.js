const User = require("../models/userModel");
const Product = require("../models/product")
const Category = require("../models/category")
const path=require("path")
const sharp=require("sharp")


const loadProduct = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.admin_id }); 
    const productData= await Product.find(); 
    const categoryData = await Category.find(); 
    res.render('product', { admin: userData, product: productData,category: categoryData });
  } catch (error) {
    console.log(error.message);
  }
};

const addProductform = async(req,res)=>{
  try{
    const userData = await User.findById({ _id: req.session.admin_id });  
    const categoryData = await Category.find(); 
    res.render('addProduct',{ admin: userData, category: categoryData } );
  } catch (error) {
    console.log(error.message);
  }
}

const addProduct = async(req,res)=>{
  try{
    const userData = await User.findById({ _id: req.session.admin_id });  
    const categoryData = await Category.find(); 
    const images = [];
    const subcat = req.body.sub_category
    for (let i = 0; i < req.files.length; i++) {
      // Modify this to the path of the temporary uploaded file
      const file = req.files[i];

      // Generate a random integer for the file name
      const randomInteger = Math.floor(Math.random() * 20000001);
      const imageDirectory = path.join('public', 'assets', 'img', 'product');
      const imgFileName = "cropped" + randomInteger + ".jpg";
      const imagePath = path.join(imageDirectory, imgFileName);
      console.log(imagePath, "Image path");

      // Perform cropping using sharp module
      const croppedImage = await sharp(file.path)
        .resize(280, 300, {
          fit: "cover",
        })
        .toFile(imagePath);

      // If cropping is successful, add the cropped image to imageData array
      if (croppedImage) {

        images.push(imgFileName);
      }
    }

    const newProduct = {
      name: req.body.name,
      image: images,
      description: req.body.product_description,
      category: req.body.category,     
      price: req.body.price,
      discount_price: req.body.discount_price,
      stock: req.body.stock,
      productColor: req.body.productColor,
      gender: req.body.gender,
    }
    const existProduct = await Product.findOne({ name: { $regex: new RegExp('^' + newProduct.name.replace(/\s+/g, ' ').trim() + '$', 'i') } });
    if (existProduct) {
      res.status(200).json({ success: false, message: 'This product already exists' });
      return
    } else {
      const product = new Product({
        name: newProduct.name,
        image: newProduct.image,
        description: newProduct.description,
        category: newProduct.category,
        sub_category:subcat,
        price: newProduct.price,
        discount_price: newProduct.discount_price,
        stock: newProduct.stock,
        productColor: newProduct.productColor,
        gender: newProduct.gender,
      });
      const productData = await product.save();

      res.status(200).json({ success: true });
    }
  } catch (error) {
    res.status(200).json({ success: false, message: error.message });
    return      
  }
}

const editProductLoad = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findById({ _id: req.session.admin_id });  
    const categoryData = await Category.find(); 
    const productData = await Product.findById({ _id: id });
    if (productData) {
      res.render("edit-product", { admin: userData ,product: productData, category: categoryData });
    } else {
      res.redirect("/admin/product");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const updateProduct = async (req, res) => {
  try {
    const id = req.body.idproduct;
    let images=[],delets=[]
    const subcat = req.body.sub_category
    const productData = await Product.findById({ _id:id });  
    const {
      name,
      description,
      category,
      price,
      discount_price,
      stock,
      productColor,
      gender, 
    }=req.body
    const existProduct = await Product.findOne({ name: { $regex: new RegExp('^' + name.replace(/\s+/g, ' ').trim() + '$', 'i') } });
    if (existProduct&&productData.name!=req.body.name) {
      res.status(200).json({ success: false, message: 'This product already exists' });
      return
    }
    else{
      if (req.body.deletecheckbox) {
        delets.push(req.body.deletecheckbox); 
        delets = delets.flat().map(x=>Number(x))
        images = productData.image.filter((img, idx) => !delets.includes(idx));
      }
      else{
        images = productData.image.map((img)=>{return img});
      }
      if(req.files.length!=0){
        for (let i = 0; i < req.files.length; i++) {
          // Modify this to the path of the temporary uploaded file
          const file = req.files[i];
    
          // Generate a random integer for the file name
          const randomInteger = Math.floor(Math.random() * 20000001);
          const imageDirectory = path.join('public', 'assets', 'img', 'product');
          const imgFileName = "cropped" + randomInteger + ".jpg";
          const imagePath = path.join(imageDirectory, imgFileName);
    
          console.log(imagePath, "Image path");
    
          // Perform cropping using sharp module
          const croppedImage = await sharp(file.path)
            .resize(280, 300, {
              fit: "cover",
            })
            .toFile(imagePath);
    
          // If cropping is successful, add the cropped image to imageData array  
          if (croppedImage) {  
            images.push(imgFileName);
          }
        }
      }
      await Product.findByIdAndUpdate(
        { _id: req.body.idproduct },
        {
          $set: {
            name: name,
            image: images,
            description: description,
            sub_category:subcat,
            category: category,
            price: price,
            discount_price: discount_price,
            stock: stock,
            productColor: productColor,
            gender: gender,
          }
        }
      )                         
    
      res.status(200).json({ success: true });
    }
  } catch (error) {
    res.status(200).json({ success: false, message: error.message });
    return      
  }
};

const deleteAndaddProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await Product.findById(id)
    if(productData.is_listed){
      await Product.updateOne(
        { _id: id },
        {
          $set: {
            is_listed: false
          },
        }
      );
    }
    else{
      await Product.updateOne(
        { _id: id },
        {
          $set: {
            is_listed: true
          },
        }
      );
    }
    res.redirect("/admin/product");
  } catch (error) {
    console.log(error.message);
  }
};

const product_details = async (req, res) => {
    try {
  
      const userData = await User.findById({ _id: req.session.user_id });
      const id = req.query.id;
      const productData= await Product.findById({_id: id}); 
      res.render("product-details", { user: userData, products:productData  });
    } catch (error) {
      console.log(error.message);
    }
  };

  module.exports = {
    loadProduct,
    addProductform,
    addProduct,
    editProductLoad,
    updateProduct,
    deleteAndaddProduct,
    product_details,
  };
  