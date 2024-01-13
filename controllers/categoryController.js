const User = require("../models/userModel");
const Category = require("../models/category")
const path=require("path")
const sharp=require("sharp")

const loadCategory = async (req, res) => {
    try {
      const userData = await User.findById({ _id: req.session.admin_id });  
      const categoryData= await Category.find();
      res.render('category', { admin: userData, category: categoryData });
    } catch (error) {
      console.log(error.message);
    }
  };
  const addCategoryform = async(req,res)=>{
    try{
      const userData = await User.findById({ _id: req.session.admin_id });  
      res.render('addCategory',{ admin: userData});
    } catch (error) {
      console.log(error.message);
    }
  }
  
  const addCategory = async(req,res)=>{
    try{
        const userData = await User.findById({ _id: req.session.admin_id });
        // Modify this to the path of the temporary uploaded file
        let image = req.file;
        // Generate a random integer for the file name
        const randomInteger = Math.floor(Math.random() * 20000001);
        const imageDirectory = path.join('public', 'assets', 'img', 'category');
        const imgFileName = "cropped" + randomInteger + ".jpg";
        const imagePath = path.join(imageDirectory, imgFileName);  
        // Perform cropping using sharp module
        const croppedImage = await sharp(image.path)
          .resize(280, 300, {
            fit: "cover",
          })
          .toFile(imagePath);
        // If cropping is successful, add the cropped image to imageData array
        if (croppedImage) {
          image =imgFileName;
        }
        const newCategory = {
          name: req.body.name,
          description: req.body.description,
          sub_category: req.body.sub_category, // This will contain an array of sub-categories
          is_listed: true,
      }
      const existCategory = await Category.findOne({ name: { $regex: new RegExp('^' + newCategory.name.replace(/\s+/g, ' ').trim() + '$', 'i') } });
      if (existCategory) {
        res.status(200).json({ success: false, message: 'This category already exists' });
        return
      } else {
          const category = new Category({
            name: req.body.name,
            image:image,
            sub_category:newCategory.sub_category,
            description: newCategory.description,
            is_listed: true,
          });
          const categoryData = await category.save();
  
          res.status(200).json({ success: true });
      }
    } catch (error) {
      res.status(200).json({ success: false, message: error.message });
      return    
    }
  }

  const editCategoryLoad = async (req, res) => {
    try {
      const id = req.query.id;
      const userData = await User.findById({ _id: req.session.admin_id });  
      const categoryData = await Category.findById({ _id: id });
      if (categoryData) {
        res.render("edit-category", { admin: userData ,category: categoryData });
      } else {
        res.redirect("/admin/category");
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  
  const updateCategory = async (req, res) => {
    try {
      const id = req.body.id ;
      const userData = await User.findById({ _id: req.session.admin_id });  
      const categoryData = await Category.findById({ _id: id });  
      if(!req.file){
       
        const existCategory = await Category.findOne({ name: { $regex: new RegExp('^' + req.body.name.replace(/\s+/g, ' ').trim() + '$', 'i') } });
        if (existCategory&&categoryData.name!=req.body.name) {
          res.status(200).json({ success: false, message: 'This category already exists' });
          return
        }
        else{
          const categoryData = await Category.findByIdAndUpdate(
            { _id: req.body.id },
            {
              $set: {
                name: req.body.name,
                sub_category: req.body.sub_category, // This will contain an array of sub-categories
                description: req.body.description
              },
            }
          );
          res.status(200).json({ success: true });
        }
        
      }
      
      else{
        // Modify this to the path of the temporary uploaded file
        const existCategory = await Category.findOne({ name: { $regex: new RegExp('^' + req.body.name.replace(/\s+/g, ' ').trim() + '$', 'i') } });
        if (existCategory&&categoryData.name!=req.body.name) {
          res.status(200).json({ success: false, message: 'This category already exists' });
          return
        }
        else{
          let image = req.file;
          // Generate a random integer for the file name
          const randomInteger = Math.floor(Math.random() * 20000001);
          const imageDirectory = path.join('public', 'assets', 'img', 'category');
          const imgFileName = "cropped" + randomInteger + ".jpg";
          const imagePath = path.join(imageDirectory, imgFileName);  
          // Perform cropping using sharp module
          const croppedImage = await sharp(image.path)
            .resize(280, 300, {
              fit: "cover",
            })
            .toFile(imagePath);
    
          // If cropping is successful, add the cropped image to imageData array
          if (croppedImage) {
            image =imgFileName;
          }
          const categoryData = await Category.findByIdAndUpdate(
            { _id: req.body.id },
            {
              $set: {
                name: req.body.name,
                image: image,
                sub_category: req.body.sub_category, // This will contain an array of sub-categories
                description: req.body.description
              },
            }
          );
        }
        res.status(200).json({ success: true });
        return
      }
    
    } catch (error) {
      res.status(200).json({ success: false, message: error.message });
      return
    }
  };
  
  const deleteAndaddCategory = async (req, res) => {
    try {
      const id = req.query.id;
      const categoryData = await Category.findById(id)
      if(categoryData.is_listed){
        await Category.updateOne(
          { _id: id },
          {
            $set: {
              is_listed: false
            },
          }
        );
        res.status(200).json({ success: true, message: 'Category unlisted' });

      }
      else{
        await Category.updateOne(
          { _id: id },
          {
            $set: {
              is_listed: true
            },
          }
        );
        res.status(200).json({ success: true, message: 'Category listed' });

      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Operation failed' });
    }
  };

  module.exports = {
    loadCategory,
    addCategory,
    addCategoryform,
    editCategoryLoad,
    updateCategory,
    deleteAndaddCategory,
  };

