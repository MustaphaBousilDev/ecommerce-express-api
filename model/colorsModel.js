const mongoose = require("mongoose"); // Erase if already required
const validator = require("validator");

// Declare the Schema of the Mongo model
var ColorSchema = new mongoose.Schema(
  {
     name: {
          type: String,
          required: [true, "color name is required"],
          unique: [true, "color name must be unique"],
          index: true,
          lowercase: true,
          trim: true,
          validator: (value) => {
               return validator.isAlpha(value.replace(/\s/g, ""));
          },
     },
     code:{
          type:String,
          required: [true, "color code is required"],
          unique: [true, "color code must be unique"],
          index: true,
          lowercase: true,
          trim: true,
          validator: (value) => {
               return validator.isHexColor(value.replace(/\s/g, ""));
          }
     },
     slug: {
          type: String,
          required: [true, "color slug is required"],
          unique: true,
          index: true,
          lowercase: true,
          trim: true,
          validator: (value) => {
               return validator.isAlpha(value.replace(/\s/g, ""));
          }
     },
     sizes: [
          {
               size:{
                    type: mongoose.Schema.ObjectId,
                    ref: "Sizes",
                    default: null,
                    validator: function(value) {
                         //must be character and number
                         return validator.isAlphanumeric(value.replace(/\s/g, ''));
                    },
               },
               quantity:{
                    type:Number,
                    default:0
               },
               product:{
                    type: mongoose.Schema.ObjectId,
                    ref: "Product",
                    default: null,
                    validator: function(value) {
                         //must be character and number
                         return validator.isAlphanumeric(value.replace(/\s/g, ''));
                    },
               }
          }
     ],
     status: {
          type: Number,
          required: [true, "color status is required"],
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




module.exports = mongoose.model("Colors",ColorSchema);
