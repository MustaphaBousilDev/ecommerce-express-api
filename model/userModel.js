const mongoose=require('mongoose');

//create schema
const userSchema=new mongoose.Schema({
     first_name:{
          type:String,
          required:[true,'first name is required'],
          min:6,
          max:255,
          trim:true,
     },
     last_name:{
          type:String,
          required:[true,'last name is required'],
          min:6,
          max:255,
     },
     username:{
          type:String ,
        required:[true,'first name is required'],
        trim:true ,
        text:true ,
        unique:true
     },
     email:{
          type:String,
          required:[true,'email is required'],
          trim:true,
          unique:true,
     },
     mobile:{
          type:String,
          required:true,
          min:10,
          max:10
     },
     password:{
          type:String,
          required:[true,'password is required'],
          min:6,
          max:1024
     },
     picture:{
          type:String,
          default:'https://res.cloudinary.com/dmhcnhtng/image/upload/v1643044376/avatars/default_pic_jeaybr.png',
          trim:true 
     },
     verified:{
          type:Boolean,
          default:false
     },
     
},{timestamps:true})

module.exports=mongoose.model('User',userSchema)