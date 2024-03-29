const mongoose=require('mongoose')

const {ObjectId}=new mongoose.Schema;

const codeSchema=new mongoose.Schema({
     code:{
          type:String,
          required:true,
     },
     user:{
          type:ObjectId,
          ref:"User",
          required:true
     }
})


exports.Code=mongoose.model('Code',codeSchema)