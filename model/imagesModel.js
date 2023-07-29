const mongoose = require("mongoose"); // Erase if already required
const validator = require("validator");

// Declare the Schema of the Mongo model
var ImgstSchema = new mongoose.Schema(
  {
     picture: {
          type: String,
          required: [true, "picture is required"],
          trim: true,
          validator: (value) => {
               //must be image of jpg or png or jpeg format only 
               return validator.isURL(value.replace(/\s/g, ""));
          },
          default:"https://res.cloudinary.com/dmhcnhtng/image/upload/v1643044376/avatars/default_pic_jeaybr.png"
     },
     cloudinary_id: {
          type: String,
          required: [true, "subcategory  of product cloudinary_id is required"],
     },
     status: {
          type: Number,
          required: [true, "status is required"],
          default: 1,
          Comment: "1 for active and 0 for inactive",
          enum: [0, 1],
          validator: function(value) {
               // Require at least one uppercase le tter, one lowercase letter, one special character and one number
               return validator.isIn(value, [0,1]);
          }
     },
     user: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          default:null,
     },
     user_updated: {
          type: mongoose.Schema.ObjectId,
          default:null 
     },
     user_deleted: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          default:null
     },
},
{timestamps:true}
);




module.exports = mongoose.model("Pimgs",ImgstSchema);
