const slugify = require("slugify");
const Size=require('../model/sizesModel')
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
const  createSize=asyncHandler(async(req,res)=>{
     try{
          const {name}=req.body
          validateSizeEnum(name)   
          const slug=slugify(name)
          req.body.slug=slug
          req.body.user=req.user._id
          validateMongoDbId(req.body.user)
          if(!validateString(name)){
               return res.status(400).json({msg:"Error title not fucking valid"})
          }
          const newSize=await Size.create(req.body)     
          res.json(newSize)
     }catch(error){
          throw new Error(error)
     }
}) 
//-----------------------------------------------------
//------------------------------------------------------
const getAllSize=asyncHandler(async(req,res)=>{
     try{
          const queryObj = { ...req.query };
          if(queryObj){
               //feltring 
               const excludeFields = ["page", "sort", "limit", "fields"];
               excludeFields.forEach((el) => delete queryObj[el]);
               let queryStr = JSON.stringify(queryObj);
               queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
               let query = Size.find(JSON.parse(queryStr));
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
                    const SizeCount = await Size.countDocuments();
                    if (skip >= SizeCount) throw new Error("This Page does not exists");
               }
               //--------------------------------------------------------
               // Execute the query
               const size = await query;
               res.json(size);
          }else{
               const size=await Size.find({}).populate('user')
               res.json(size)
          }
     }catch(error){
          throw new Error(error)
     }
})
//------------------------------------------------------
//------------------------------------------------------
const updateSize = asyncHandler(async (req, res) => {
     const {id}=req.params 
     validateMongoDbId(id);
     console.log(id)
     try {
          req.body.slug = req.body.name && slugify(req.body.name);
          req.body.user_updated=req.user._id 
          const Sizeupdated= await Size.findByIdAndUpdate(id,{
               name:req?.body?.name,
               user_updated:req?.user?._id,
               slug:req?.body?.slug,
               status:req?.body?.status,
          },{new: true});

          
     res.json(Sizeupdated);
     } catch (error) {
       res.status(400).json({msg:error.message});
     }
});
//------------------------------------------------------
//------------------------------------------------------
const deleteSize = asyncHandler(async (req, res) => {
     const {id}=req.params
     validateMongoDbId(id);
     try {
          const deleteSize = await Size.findByIdAndDelete(id);
          res.json(deleteSize);
     } catch (error) {
          throw new Error(error);
     }
});
//------------------------------------------------------
//------------------------------------------------------
const getSize=asyncHandler(async (req,res)=>{
     const { id } = req.params;
     validateMongoDbId(id);
     try {
          const findSize= await Size.findById(id);
          res.json(findSize);
     } catch (error) {
          throw new Error(error);
     }
})
//------------------------------------------------------
//------------------------------------------------------
const hiddenSize = asyncHandler(async (req, res) => {
     const {id}=req.params
     validateMongoDbId(id);
     try {
          const hiddenSize = await Size.findByIdAndUpdate(id,{status:0},{new: true});
          res.json( hiddenSize);
     } catch (error) {
          throw new Error(error);
     }
})
//------------------------------------------------------
//------------------------------------------------------
const DisplaySize = asyncHandler(async (req, res) => {
     const {id}=req.params
     validateMongoDbId(id);
     try {
          //get ctaegory by id and check if status is 0
          const size= await Size.findById(id);
          if(size.status===0){
               const DisplaySize = await Size.findByIdAndUpdate(id,{status:1},{new: true});
               res.json(DisplaySize);
          }else{
               res.status(400).json({msg:"Size already displayed"})
          }
     } catch (error) {
          throw new Error(error);
     }
})
//------------------------------------------------------
//------------------------------------------------------
const SearchSize = asyncHandler(async (req, res) => {
     const {search}=req.body 
     //validateString is a function that check if the string is empty or not
     if(!validateString(search)){
          return res.status(400).json({msg:"Error search not fucking valid"})
     }
     try {
          const size= await Size.find(
               {name:{
                    //regex is used to find the word in the string
                    $regex:search,
                    //options i is used to find the word in the string even if it is in uppercase or lowercase
                    $options:'i'
                    }
               });
          res.json(size);
     } catch (error) {
          
          res.status(400).json({msg:error.message})
     }
})

module.exports={
     createSize,getAllSize,getSize,updateSize,deleteSize,
     DisplaySize,hiddenSize,SearchSize
}