const mongoose = require("mongoose"); // Erase if already required
const validator = require("validator");

// Declare the Schema of the Mongo model
var SizeSchema = new mongoose.Schema(
  {
     name: {
          type: String,
          required: [true, "size name is required"],
          unique: [true, "size name must be unique"],
          index: true,
          lowercase: true,
          
     },
     slug: {
          type: String,
          required: [true, "size slug is required"],
          unique: true,
          index: true,
          lowercase: true,
          trim: true,
          validator: (value) => {
               return validator.isAlpha(value.replace(/\s/g, ""));
          }
     },
     status: {
          type: Number,
          required: [true, "size status is required"],
          default: 1,
          Comment: "1 for active and 0 for inactive",
          enum: [0, 1],
          validator: function(value) {
               // Require at least one uppercase le tter, one lowercase letter, one special character and one number
               return validator.isIn(value, [0,1]);
          }
     },
     products: [
          {
               type: mongoose.Schema.ObjectId,
               ref: "Product",
               default: null,
               validator: function(value) {
                    //must be character and number 
                    return validator.isAlphanumeric(value.replace(/\s/g, ''));
               },
          },
     ],
     colors: [
          {
               type: mongoose.Schema.ObjectId,
               ref: "Colors",
               default: null,
               validator: function(value) {
                    //must be character and number
                    return validator.isAlphanumeric(value.replace(/\s/g, ''));
               },
          },
          
     ],
     user: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          default:null,
     },
     user_updated: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
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




module.exports = mongoose.model("Sizes",SizeSchema);
