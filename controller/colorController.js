const slugify = require("slugify");
const Color=require('../model/colorsModel')
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
const  createColor=asyncHandler(async(req,res)=>{
     try{
          const {name,code}=req.body
          validateColorEnum(name)
          validateString(code)   
          const slug=slugify(name)
          req.body.slug=slug
          req.body.user=req.user._id
          validateMongoDbId(req.body.user)
          if(!validateString(name)){
               return res.status(400).json({msg:"Error title not fucking valid"})
          }
          const newColor=await Color.create(req.body)     
          res.json(newColor)
     }catch(error){
          throw new Error(error)
     }
}) 
//-----------------------------------------------------
//------------------------------------------------------
const getAllColor=asyncHandler(async(req,res)=>{
     try{
          const queryObj = { ...req.query };
          if(queryObj){
               //feltring 
               const excludeFields = ["page", "sort", "limit", "fields"];
               excludeFields.forEach((el) => delete queryObj[el]);
               let queryStr = JSON.stringify(queryObj);
               queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
               let query = Color.find(JSON.parse(queryStr));
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
                    const ColorCount = await Color.countDocuments();
                    if (skip >= ColorCount) throw new Error("This Page does not exists");
               }
               //--------------------------------------------------------
               // Execute the query
               const color = await query;
               res.json(color);
          }else{
               const color=await Color.find({}).populate('user')
               res.json(color)
          }
     }catch(error){
          throw new Error(error)
     }
})
//------------------------------------------------------
//------------------------------------------------------
const updateColor= asyncHandler(async (req, res) => {
     const {id}=req.params 
     validateMongoDbId(id);
     console.log(id)
     try {
          req.body.slug = req.body.name && slugify(req.body.name);
          req.body.user_updated=req.user._id 
          const Colorupdated= await Color.findByIdAndUpdate(id,{
               name:req?.body?.name,
               code:req?.body?.code,
               user_updated:req?.user?._id,
               slug:req?.body?.slug,
               status:req?.body?.status,
          },{new: true});

          
     res.json(Colorupdated);
     } catch (error) {
       res.status(400).json({msg:error.message});
     }
});
//------------------------------------------------------
//------------------------------------------------------
const deleteColor = asyncHandler(async (req, res) => {
     const {id}=req.params
     validateMongoDbId(id);
     try {
          const deleteColor = await Color.findByIdAndDelete(id);
          res.json(deleteColor);
     } catch (error) {
          throw new Error(error);
     }
});
//------------------------------------------------------
//------------------------------------------------------
const getColor=asyncHandler(async (req,res)=>{
     const { id } = req.params;
     validateMongoDbId(id);
     try {
          const findColor= await Color.findById(id);
          res.json(findColor);
     } catch (error) {
          throw new Error(error);
     }
})
//------------------------------------------------------
//------------------------------------------------------
const hiddenColor = asyncHandler(async (req, res) => {
     const {id}=req.params
     validateMongoDbId(id);
     try {
          const hiddenColor= await Color.findByIdAndUpdate(id,{status:0},{new: true});
          res.json( hiddenColor);
     } catch (error) {
          throw new Error(error);
     }
})
//------------------------------------------------------
//------------------------------------------------------
const DisplayColor = asyncHandler(async (req, res) => {
     const {id}=req.params
     validateMongoDbId(id);
     try {
          //get ctaegory by id and check if status is 0
          const color= await Color.findById(id);
          if(color.status===0){
               const DisplayColor = await Color.findByIdAndUpdate(id,{status:1},{new: true});
               res.json(DisplayColor);
          }else{
               res.status(400).json({msg:"Color already displayed"})
          }
     } catch (error) {
          throw new Error(error);
     }
})
//------------------------------------------------------
//------------------------------------------------------
const SearchColor = asyncHandler(async (req, res) => {
     const {search}=req.body 
     //validateString is a function that check if the string is empty or not
     if(!validateString(search)){
          return res.status(400).json({msg:"Error search not fucking valid"})
     }
     try {
          const color= await Color.find(
               {name:{
                    //regex is used to find the word in the string
                    $regex:search,
                    //options i is used to find the word in the string even if it is in uppercase or lowercase
                    $options:'i'
                    }
               });
          res.json(color);
     } catch (error) {
          
          res.status(400).json({msg:error.message})
     }
})

module.exports={
     createColor,
     getAllColor,
     getColor,
     updateColor,
     deleteColor,
     SearchColor,
     DisplayColor,
     hiddenColor
}