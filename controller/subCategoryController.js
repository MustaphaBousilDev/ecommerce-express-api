const slugify = require("slugify");
const SubCategory=require('../model/subCatProduct')
const User=require('../model/userModel')
const cloudinary = require("../helpers/cloudinary");
const fs = require('fs');
const asyncHandler= require('express-async-handler')
const validateMongoDbId = require('../helpers/validateMongoDB')

const {
     validateStatus,
     validateString,
     validateSizeEnum,
     validateNumberIntegers,
     validateNumber,
     validateColorEnum,
     validateImage,
}=require('../helpers/validations')


//-----------------------------------------------------
const createSubCategory=asyncHandler(async(req,res)=>{
     console.log('hello from create sub category')
     try{
          
          const {name,category}=req.body   
          const {path} =req.file;
          console.log('path')
          console.log(path)
          
          const slug=slugify(name)
          req.body.slug=slug
          req.body.user=req.user._id
          validateMongoDbId(category)
          
          if(!validateString(name)){
               return res.status(400).json({msg:"Error title not fucking valid"})
          }
          const result = await cloudinary.uploader.upload(path);
          const newSubCategory=await SubCategory.create({
               name:req.body.name ,
               category:req.body.category , 
               slug:req.body.slug,
               user:req.body.user,
               picture:result.secure_url,
               cloudinary_id:result.public_id
          })  
          
          //removed the uploaded image from the uploads folder
          fs.unlinkSync(path);
          res.json(newSubCategory)
     }catch(error){
          throw new Error(error)
     }
}) 
//-----------------------------------------------------
//------------------------------------------------------
const getAllSubCategory=asyncHandler(async(req,res)=>{
     try{
          const queryObj = { ...req.query };
          if(queryObj){
               //feltring 
               const excludeFields = ["page", "sort", "limit", "fields"];
               excludeFields.forEach((el) => delete queryObj[el]);
               let queryStr = JSON.stringify(queryObj);
               queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
               let query = SubCategory.find(JSON.parse(queryStr));
               //-------------------------------------------------------
               // Sorting
               if (req.query.sort) {
                    const sortBy = req.query.sort.split(",").join(" ");
                    query = query.sort(sortBy);
               } else {
                    query = query.sort("-createdAt");
               }
               //-------------------------------------------------------
               //Limiting the Fields
               if (req.query.fields) {
                    const fields = req.query.fields.split(",").join(" ");
                    query = query.select(fields);
               } else {
               query = query.select("-__v");
               }
               //--------------------------------------------------------
               // pagination
               const page = parseInt(req.query.page) || 1;
               const limit = parseInt(req.query.limit) || 5;
               const skip = (page - 1) * limit;
               query = query.skip(skip).limit(limit);
               if (req.query.page) {
                    const categoytCount = await SubCategory.countDocuments();
                    if (skip >= categoytCount) throw new Error("This Page does not exists");
               }
               //--------------------------------------------------------
 



               const subcategories = await query;
               res.json(subcategories);
          }else{
               const subcategory=await SubCategory.find({}).populate('user')
               res.json(subcategory)
          }
     }catch(error){
          throw new Error(error)
     }
})
//------------------------------------------------------
//------------------------------------------------------
const updateSubCategory = asyncHandler(async (req, res) => {
     const {id}=req.params 
     validateMongoDbId(id);
     try {
          req.body.slug = req.body.name && slugify(req.body.name);
          req.body.category=req.body.category && validateColorEnum(req.body.category)
          req.body.user_updated=req.user._id 
          const updateSubCategory= await SubCategory.findByIdAndUpdate(id,{
               name:req?.body?.name,
               category:req?.body?.category,
               user_updated:req?.body?.user_updated,
               slug:req?.body?.slug,
               status:req?.body?.status,
     },{new: true});
     res.json(updateSubCategory);
     } catch (error) {
       throw new Error(error);
     }
});
//------------------------------------------------------
//------------------------------------------------------
const deleteSubCategory = asyncHandler(async (req, res) => {
     const {id}=req.params
     validateMongoDbId(id);
     try {
          const deleteSubCategory = await SubCategory.findOneAndDelete(id);
          res.json(deleteSubCategory);
     } catch (error) {
          throw new Error(error);
     }
});
//------------------------------------------------------
//------------------------------------------------------
const getSubCategory=asyncHandler(async (req,res)=>{
     const { id } = req.params;
     validateMongoDbId(id);
     try {
          const findSubCategory = await SubCategory.findById(id);
          res.json(findSubCategory);
     } catch (error) {
          throw new Error(error);
     }
})
//------------------------------------------------------
//------------------------------------------------------
const hiddenSubCategory = asyncHandler(async (req, res) => {
     const {id}=req.params
     validateMongoDbId(id);
     try {
          const hiddenSubCategory = await SubCategory.findOneAndUpdate(id,{status:0},{new: true});
          res.json(hiddenSubCategory);
     } catch (error) {
          throw new Error(error);
     }
})
//------------------------------------------------------
//------------------------------------------------------
const DisplaySubCategory = asyncHandler(async (req, res) => {
     const {id}=req.params
     validateMongoDbId(id);
     try {
          //get ctaegory by id and check if status is 0
          const subcategory = await SubCategory.findById(id);
          if(subcategory.status===0){
               const DisplaySubCategory = await SubCategory.findOneAndUpdate(id,{status:1},{new: true});
               res.json(DisplaySubCategory);
          }else{
               res.status(400).json({msg:"Sub Category already displayed"})
          }
     } catch (error) {
          throw new Error(error);
     }
})
//------------------------------------------------------
//------------------------------------------------------
const SearchSubCategory = asyncHandler(async (req, res) => {
     const {search}=req.body 
     //validateString is a function that check if the string is empty or not
     if(!validateString(search)){
          return res.status(400).json({msg:"Error search not fucking valid"})
     }
     try {
          const subcategory = await SubCategory.find(
               {name:{
                    //regex is used to find the word in the string
                    $regex:search,
                    //options i is used to find the word in the string even if it is in uppercase or lowercase
                    $options:'i'
                    }
               });
          res.json(subcategory);
     } catch (error) {
          res.status(400).json({msg:error.message})
     }
})

module.exports={
     createSubCategory,
     getAllSubCategory,
     updateSubCategory,
     deleteSubCategory,
     getSubCategory,
     hiddenSubCategory,
     DisplaySubCategory,
     SearchSubCategory
}