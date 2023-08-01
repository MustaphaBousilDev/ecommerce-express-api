const slugify = require("slugify");
const Tags=require('../model/tagsProduct')
const User=require('../model/userModel')
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
const createTag=asyncHandler(async(req,res)=>{
     try{
          const {name}=req.body   
          const slug=slugify(name)
          req.body.slug=slug
          req.body.user=req.user._id
          validateMongoDbId(req.body.user)
          if(!validateString(name)){
               return res.status(400).json({msg:"Error title not fucking valid"})
          }
          const newTag=await Tags.create(req.body)     
          res.json(newTag)
     }catch(error){
          throw new Error(error)
     }
}) 
//-----------------------------------------------------
//------------------------------------------------------
const getAllTags=asyncHandler(async(req,res)=>{
     try{
          const queryObj = { ...req.query };
          if(queryObj){
               //feltring 
               const excludeFields = ["page", "sort", "limit", "fields"];
               excludeFields.forEach((el) => delete queryObj[el]);
               let queryStr = JSON.stringify(queryObj);
               queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
               let query = Tags.find(JSON.parse(queryStr));
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
                    const tagsCount = await Tags.countDocuments();
                    if (skip >= tagsCount) throw new Error("This Page does not exists");
               }
               //--------------------------------------------------------
               // Execute the query
               const tags= await query;
               res.json(tags);
          }else{
               const tags=await Tags.find({}).populate('user').populate('products')
               res.json(tags)
          }
     }catch(error){
          throw new Error(error)
     }
})
//------------------------------------------------------
//------------------------------------------------------
const updateTags = asyncHandler(async (req, res) => {
     const {id}=req.params 
     validateMongoDbId(id);
     console.log(id)
     try {
          req.body.slug = req.body.name && slugify(req.body.name);
          req.body.user_updated=req.user._id 
          const tagsupdated= await Tags.findByIdAndUpdate(id,{
               name:req?.body?.name,
               user_updated:req?.user?._id,
               slug:req?.body?.slug,
               status:req?.body?.status,
          },{new: true});

          
     res.json(tagsupdated);
     } catch (error) {
       res.status(400).json({msg:error.message});
     }
});
//------------------------------------------------------
//------------------------------------------------------
const deleteTag = asyncHandler(async (req, res) => {
     const {id}=req.params
     validateMongoDbId(id);
     try {
          const deleteTag = await Tags.findByIdAndDelete(id);
          res.json(deleteTag);
     } catch (error) {
          throw new Error(error);
     }
});
//------------------------------------------------------
//------------------------------------------------------
const getTag=asyncHandler(async (req,res)=>{
     const { id } = req.params;
     validateMongoDbId(id);
     try {
          const findTag= await Tags.findById(id);
          res.json(findTag);
     } catch (error) {
          throw new Error(error);
     }
})
//------------------------------------------------------
//------------------------------------------------------
const hiddenTag = asyncHandler(async (req, res) => {
     const {id}=req.params
     validateMongoDbId(id);
     try {
          const hiddenTag = await Tags.findByIdAndUpdate(id,{status:0},{new: true});
          res.json(hiddenTag);
     } catch (error) {
          throw new Error(error);
     }
})
//------------------------------------------------------
//------------------------------------------------------
const DisplayTag = asyncHandler(async (req, res) => {
     const {id}=req.params
     validateMongoDbId(id);
     try {
          //get ctaegory by id and check if status is 0
          const tag = await Tags.findById(id);
          if(tag.status===0){
               const DisplayTag = await Tags.findByIdAndUpdate(id,{status:1},{new: true});
               res.json(DisplayTag);
          }else{
               res.status(400).json({msg:"Tag already displayed"})
          }
     } catch (error) {
          throw new Error(error);
     }
})
//------------------------------------------------------
//------------------------------------------------------
const SearchTag = asyncHandler(async (req, res) => {
     const {search}=req.body 
     //validateString is a function that check if the string is empty or not
     if(!validateString(search)){
          return res.status(400).json({msg:"Error search not fucking valid"})
     }
     try {
          const tag = await Tags.find(
               {name:{
                    //regex is used to find the word in the string
                    $regex:search,
                    //options i is used to find the word in the string even if it is in uppercase or lowercase
                    $options:'i'
                    }
               });
          res.json(tag);
     } catch (error) {
          res.status(400).json({msg:error.message})
     }
})

module.exports={
     createTag,
     updateTags,
     deleteTag,
     getTag,
     getAllTags,
     SearchTag,
     hiddenTag,
     DisplayTag
}