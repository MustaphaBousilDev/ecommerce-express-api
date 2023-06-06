const mongoose=require('mongoose')
const validator=require('validator')

const productSchema=new mongoose.Schema({
     title:{
          type:String,
          required:[true,'product name is required'],
          trim:true,
          unique:true,
          //validate mutch have character and number is optional
          validator: (value) => {
               return validator.isAlphanumeric(value.replace(/\s/g, ''));
          }
     },
     slug:{
          type:String,
          required:[true,'product slug is required'],
          trim:true,
          lowercase:true,
          unique:true,
          
     },
     short_description:{
          type:String,
          //not required 
          required:true,
          trim:true,
          lowercase:true,
          
     },
     description:{
          type:String,
          required:true,
          trim:true,
          lowercase:true,
     },
     r_price:{
          type:Number,
          required:false,
          trim:true,
          //default value
          default:0,
          validator: (value) => {
               // remove all spaces from string value
               return validator.isNumeric(value.replace(/\s/g, ''));
          }
     },
     s_price:{
          type:Number,
          required:[true,'product sale price is required'],
          trim:true,
          validator: (value) => {
               // remove all spaces from string value
               return validator.isNumeric(value.replace(/\s/g, ''));
          }
     },
     SKU:{
          type:String,
          required:[true,'product SKU is required'],
          trim:true,
          lowercase:true,
          unique:true,
     },
     status :{
          type:Number,
          required:[true,'product status is required'],
          enum:[0,1],
          default:1,
          comment:'0=inactive,1=active',
          validator: function(value) {
               // Require at least one uppercase le tter, one lowercase letter, one special character and one number
               return validator.isIn(value, [0,1]);
          }
     },
     stock_total:{
          type:Number,
          required:[true,'product stock total is required'],
          default:0,
          validator: (value) => {
               // is numeric and integer
               return validator.isNumeric(value.replace(/\s/g, '')) && validator.isInt(value.replace(/\s/g, ''));
          }
     },
     bareCode:{
          type:String,
          required:false,
          trim:true,
          lowercase:true,
          unique:true,
     },
     made:{
          //relation with country table 
          type:String,
          ref:'country',
          default:null,
          /*required:[true,'product made is required'],
          validator: function(value) {
               // int and numeric
               return validator.isNumeric(value.replace(/\s/g, '')) && validator.isInt(value.replace(/\s/g, ''));
          }*/
     },
     subCategory:{
          //relation with category table
          type:String,
          ref:'SubCategory',
          default:"erererer",
          required:false,
          /*validator: function(value) {
               //must be character and number 
               return validator.isAlphanumeric(value.replace(/\s/g, ''));
          }*/
     },
     brand:{
          //relation with brand table
          type:String,
          ref:'Brand',
          required:[true,'product brand is required'],
          default:null,
     },
     tags:{
          //relation with tag table
          type:Array,
          ref:'tag',
          default:[],
          required:[true,'product tags is required'],
          validator: function(value) {
               // int and numeric
               return validator.isNumeric(value.replace(/\s/g, '')) && validator.isInt(value.replace(/\s/g, ''));
          }
     },
     images:{
          type:Array,
          required:[true,'product images is required'],
          validator: function(value) {
               // character and number
               return validator.isAlphanumeric(value.replace(/\s/g, ''));
          }
     },
     color:{
          type:String,
          enum:['red','blue','green','yellow','black','white','orange','pink','purple','brown','gray','silver','gold','other'],
          required:[true,'product color is required'],
          validator: function(value) {
               //one of array value
               return validator.isIn(value, ['red','blue','green','yellow','black','white','orange','pink','purple','brown','gray','silver','gold','other']);
          },
          default:'other'
     },
     size:{
          type:String,
          enum:['xs','s','m','l','xl','xxl','xxxl','other'],
          required:[true,'product size is required'],
          validator: function(value) {
               //one of array value
               return validator.isIn(value, ['xs','s','m','l','xl','xxl','xxxl','other']);
          },
          default:'other'
     },
     user:{
          //relation with user table
          type:String,
          ref:'user',
          default:null,
          required:false,
          /*validator: function(value) {
               // int and numeric
               return validator.isNumeric(value.replace(/\s/g, '')) && validator.isInt(value.replace(/\s/g, ''));
          }*/
     },
     ratings:{
          star:Number,
          comment:String,
          
          postedBy:{
               //relation with user table
               type:String,
               ref:'User',
               default:null,
               required:false,
          },
          created_at:{
               type:Date,
               required:false,
               default:null,
               /*validator: function(value) {
                    // Require at least one uppercase le tter, one lowercase letter, one special character and one number
                    return validator.isDate(value);
               }*/
          },
          updated_at:{
               type:Date,
               required:false,
               default:null,
               /*validator: function(value) {
                    // Require at least one uppercase le tter, one lowercase letter, one special character and one number
                    return validator.isDate(value);
               }*/
          },
          deleted_at:{
               type:Date,
               required:false,
               default:null,
               /*validator: function(value) {
                    // Require at least one uppercase le tter, one lowercase letter, one special character and one number
                    return validator.isDate(value);
               }*/
          },
          


     },
     stock_status:{
          type:Number,
          required:[true,'product stock status is required'],
          enum:[0,1],
          default:1,
          comment:'0=out of stock,1=in stock',
          validator: function(value) {
               // Require at least one uppercase le tter, one lowercase letter, one special character and one number
               return validator.isIn(value, [0,1]);
          }
     },
     deleted:{
          type:Date,
          required:false,
          default:null,
          /*validator: function(value) {
               // Require at least one uppercase le tter, one lowercase letter, one special character and one number
               return validator.isDate(value);
          }*/
     },
     user_update:{
          //relation with user table
          type:String,
          ref:'User',
          default:null,
          required:false,
          /*validator: function(value) {
               // int and numeric
               return validator.isNumeric(value.replace(/\s/g, '')) && validator.isInt(value.replace(/\s/g, ''));
          }*/
     }, 
     user_delete:{
          //relation with user table
          type:String,
          ref:'User',
          required:false,
          default:null,
          /*validator: function(value) {
               // int and numeric
               return validator.isNumeric(value.replace(/\s/g, '')) && validator.isInt(value.replace(/\s/g, ''));
          }*/
     }
},{
     timeseries:true
}

)


module.exports=mongoose.model("Product",productSchema)