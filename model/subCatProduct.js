const mongoose = require("mongoose"); // Erase if already required
const validator = require("validator");

// Declare the Schema of the Mongo model
var SubCategoryProductSchema = new mongoose.Schema(
  {
    name: {
          type: String,
          required: [true, "subcategory  of product name is required"],
          unique: [true, "subcategory  of product name must be unique"],
          index: true,
          lowercase: true,
          trim: true,
          validator: (value) => {
               return validator.isAlpha(value.replace(/\s/g, ""));
          },
     },
     slug: {
          type: String,
          required: [true, "subcategory  of product slug is required"],
          unique: true,
          index: true,
          lowercase: true,
          trim: true,
          validator: (value) => {
               return validator.isAlpha(value.replace(/\s/g, ""));
          }
     },
     picture: {
          type: String,
          required: [true, "subcategory  of product picture is required"],
          trim: true,
          validator: (value) => {
               //must be image of jpg or png or jpeg format only 
               return validator.isURL(value.replace(/\s/g, ""));
          },
          default:"https://res.cloudinary.com/dmhcnhtng/image/upload/v1643044376/avatars/default_pic_jeaybr.png"
     },
     status: {
          type: Number,
          required: [true, "subcategory  of product status is required"],
          default: 1,
          Comment: "1 for active and 0 for inactive",
          enum: [0, 1],
          validator: function(value) {
               // Require at least one uppercase le tter, one lowercase letter, one special character and one number
               return validator.isIn(value, [0,1]);
          }
     },
     category:{
          type: mongoose.Schema.ObjectId,
          ref: "Category",
          required: [true, "category  of product category is required"],
          /*validator:function(value){
               //replace space with empty string
               return validator.isMongoId(value.replace(/\s/g, ""));
          }*/
          default:null,
     },
     user: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          //required: [true, "category  of product user is required"],
          /*validator: function(value) {
               // int and numeric
               return validator.isNumeric(value.replace(/\s/g, "")) && validator.isInt(value.replace(/\s/g, ""));
          }*/
          default:null,
     },
     user_updated: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          //required: [true, "category  of product user_updated is required"],
          /*validator: function(value) {
               // int and numeric
               return validator.isNumeric(value.replace(/\s/g, "")) && validator.isInt(value.replace(/\s/g, ""));
          },*/
          default:null 
     },
     user_deleted: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          //required: [true, "category  of product user_deleted is required"],
          /*validator: function(value) {
               // int and numeric
               return validator.isNumeric(value.replace(/\s/g, "")) && validator.isInt(value.replace(/\s/g, ""));
          },*/
          default:null
     },
},
{timestamps:true}
);



// Assuming you have already required the necessary models (User, Category)
prodcategorySchema.methods.getCategories = async function() {
     const categories = await Category.find({ userId: this._id });
     return categories;
};
//Export the model
module.exports = mongoose.model("PSubCategory", prodcategorySchema);
