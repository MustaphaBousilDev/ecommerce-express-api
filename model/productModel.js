const mongoose=require('mongoose')
const validator=require('validator')

const productSchema=new mongoose.Schema({
     title:{
          type:String,
          required:[true,'product name is required'],
          trim:true,
          unique:true,
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
          validator: (value) => {
               return validator.isAlphanumeric(value.replace(/\s/g, ''));
          }
     },
     short_description:{
          type:String,
          required:true,
          trim:true,
          lowercase:true,
          maxlength:100,
          minlength:10,
          validator : (value) => {
               return validator.isAlphanumeric(value.replace(/\s/g, ''));
          }
          
     },
     description:{
          type:String,
          trim:true,
          lowercase:true,
     },
     r_price:{
          type:Number,
          required:false,
          trim:true,
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
               return validator.isNumeric(value.replace(/\s/g, ''));
          }
     },
     SKU:{
          type:String,
          required:[true,'product SKU is required'],
          trim:true,
          lowercase:true,
          unique:true,
          validator: (value) => {
               return validator.isAlphanumeric(value.replace(/\s/g, ''));
          }
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
          validator: (value) => {
               return validator.isAlphanumeric(value.replace(/\s/g, ''));
          }
     },
     made:{
          type:mongoose.Schema.ObjectId,
          ref:'Country',
          default:null,
          required:[true,'product made is required'],
          //must be validation id of country table
          validator: function(value) {
               //must be character and number 
               return validator.isAlphanumeric(value.replace(/\s/g, ''));
          }
     },
     subCategory:{
          type:mongoose.Schema.ObjectId,
          ref:'PSubCategory',
          default:null,
          required:false,
          validator: function(value) {
               //must be character and number 
               return validator.isAlphanumeric(value.replace(/\s/g, ''));
          }
     },
     brand:{
          type:mongoose.Schema.ObjectId,
          ref:'PBrands',
          required:[true,'product brand is required'],
          default:null,
          validator: function(value) {  
               //must be character and number 
               return validator.isAlphanumeric(value.replace(/\s/g, ''));
          }
     },
     tags:[
          {
               type:mongoose.Schema.ObjectId,
               ref:'PTags',
               required:false,
               default:null,
               validator: function(value) {
                    //must be character and number 
                    return validator.isAlphanumeric(value.replace(/\s/g, ''));
               }
          }
     ],
     SizesColors:[
          {
               size:{
                    type:mongoose.Schema.ObjectId,
                    ref:'Sizes',
                    default:null,
                    required:false,
                    validator: function(value) {
                         //must be character and number 
                         return validator.isAlphanumeric(value.replace(/\s/g, ''));
                    },
               },
               colors:[
                    {
                         color:{
                              type:mongoose.Schema.ObjectId,
                              ref:'Colors',
                              default:null
                         },
                         quantity:{
                              type:Number,
                              default:0
                         }
                    }
               ]
          }
     ],
     user:{
          type:mongoose.Schema.ObjectId,
          ref:'user',
          default:null,
          required:true,
          validator: function(value) {
               //must be character and number 
               return validator.isAlphanumeric(value.replace(/\s/g, ''));
          }
     },
     ratings:[
          {
               star:Number,
               comment:String, 
               postedBy:{
                    type:mongoose.Schema.ObjectId,
                    ref:'User',
                    default:null,
                    required:false,
               },
               created_at:{
                    type:Date,
                    required:false,
                    default:null,
                    validator: function(value) {
                         return validator.isDate(value);
                    }
               },
               updated_at:{
                    type:Date,
                    required:false,
                    default:null,
                    validator: function(value) {
                         // Require at least one uppercase le tter, one lowercase letter, one special character and one number
                         return validator.isDate(value);
                    }
               },
               deleted_at:{
                    type:Date,
                    required:false,
                    default:null,
                    validator: function(value) {
                         // Require at least one uppercase le tter, one lowercase letter, one special character and one number
                         return validator.isDate(value);
                    }
               },
          }
     ],
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
          validator: function(value) {
               // Require at least one uppercase le tter, one lowercase letter, one special character and one number
               return validator.isDate(value);
          }
     },
     user_update:{
          type:mongoose.Schema.ObjectId,
          ref:'User',
          default:null,
          required:false,
          validator: function(value) {
               //must be character and number 
               return validator.isAlphanumeric(value.replace(/\s/g, ''));
          }
     }, 
     user_delete:{
          //relation with user table
          type:mongoose.Schema.ObjectId,
          ref:'User',
          required:false,
          default:null,
          validator: function(value) {
               //must be character and number 
               return validator.isAlphanumeric(value.replace(/\s/g, ''));
          }
     }
},{
     timeseries:true
}

)


module.exports=mongoose.model("Product",productSchema)