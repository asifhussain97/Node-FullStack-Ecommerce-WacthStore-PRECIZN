const User = require("../models/userModel")
const Address = require("../models/address")



// add address post

const addAddress = async(req,res)=>{
  try {

    const userId = req.session.user_id

    const{houseName,street,city,state,pincode} = req.body

    const address = new Address({
      user:userId,
      houseName,
      street,
      city,
      state,
      pincode

    })

    const addressData = await address.save()

    res.status(200).json({ success: true, message: 'New Addess added' });

    
  } catch (error) {
    console.log(error.message);
  }
}

//load edit address 

const  loadEditAddress = async(req,res)=>{
  try {
    
    const userId = req.session.user_id
    const userData = await User.findById(userId)

    const id = req.query.id
    const address = await Address.findById(id)
   
    if (address) {
      // If the address is found, send it in the response as JSON
      res.status(200).json({
          success: true,
          houseName: address.houseName,
          street: address.street,
          city: address.city,
          state: address.state,
          pincode: address.pincode,

          // Add other fields you need
          _id: address._id // Assuming your address object has an _id field
      });
    } else {
          // If the address is not found or some error occurs, send an appropriate response
          res.status(404).json({ success: false, message: 'Address not found' });
      }

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// update edit address 
const updateAddress = async (req, res) => {
  try {
      const id = req.body.editAddressId;

      const { editHouseName, editStreet, editCity, editState, editPincode } = req.body;
      const updatedAddress = await Address.findByIdAndUpdate(
          { _id:id },
          {
              $set: {
                  houseName:editHouseName,
                  street:editStreet,
                  city:editCity,
                  state:editState,
                  pincode:editPincode
              }
          }
      );

      if (updatedAddress) {
          res.status(200).json({ success: true, message: 'Address has been updated' });
      } else {
          res.status(404).json({ success: false, message: 'Address not found' });
      }
  } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// delete address
const deleteAddress = async (req, res) => {
  try {
      const id = req.query.id;
      
      // Logic to delete the address associated with the addressId
      // This could involve database operations or any necessary checks

      // For example, deleting the address from the database
      const deletedAddress = await Address.findByIdAndDelete(id);

      if (!deletedAddress) {
           res.status(404).json({ success: false, error: "Address not found" });
           return
      }

      return res.status(200).json({success: true,  message: "Address deleted successfully" });
  } catch (err) {
       res.status(500).json({ success: false, error: "Error deleting address" });
       return
  }
};


module.exports = {
  addAddress,
  loadEditAddress,
  updateAddress,
  deleteAddress
}