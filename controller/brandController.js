const slugify = require("slugify");
const Brand=require('../model/brandModel')
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
const createBrand=asyncHandler(async(req,res)=>{
     try{
          const {name}=req.body   
          const slug=slugify(name)
          req.body.slug=slug
          req.body.user=req.user._id
          validateMongoDbId(req.body.user)
          if(!validateString(name)){
               return res.status(400).json({msg:"Error title not fucking valid"})
          }
          const newBrand=await Brand.create(req.body)     
          res.json(newBrand)
     }catch(error){
          throw new Error(error)
     }
}) 
//-----------------------------------------------------
//------------------------------------------------------
const getAllBrands=asyncHandler(async(req,res)=>{
     try{
          const queryObj = { ...req.query };
          if(queryObj){
               //feltring 
               const excludeFields = ["page", "sort", "limit", "fields"];
               excludeFields.forEach((el) => delete queryObj[el]);
               let queryStr = JSON.stringify(queryObj);
               queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
               let query = Brand.find(JSON.parse(queryStr));
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
                    const categoytCount = await Brand.countDocuments();
                    if (skip >= categoytCount) throw new Error("This Page does not exists");
               }
               //--------------------------------------------------------
               // Execute the query
               const brands = await query;
               res.json(brands);
          }else{
               const brands=await Brand.find({}).populate('user')
               res.json(brands)
          }
     }catch(error){
          throw new Error(error)
     }
})
//------------------------------------------------------
//------------------------------------------------------
const updateBrand = asyncHandler(async (req, res) => {
     const {id}=req.params 
     validateMongoDbId(id);
     console.log(id)
     try {
          req.body.slug = req.body.name && slugify(req.body.name);
          req.body.user_updated=req.user._id 
          const brandupdated= await Brand.findByIdAndUpdate(id,{
               name:req?.body?.name,
               user_updated:req?.user?._id,
               slug:req?.body?.slug,
               status:req?.body?.status,
          },{new: true});

          
     res.json(brandupdated);
     } catch (error) {
       res.status(400).json({msg:error.message});
     }
});
//------------------------------------------------------
//------------------------------------------------------
const deleteBrand = asyncHandler(async (req, res) => {
     const {id}=req.params
     validateMongoDbId(id);
     try {
          const deleteBrand = await Brand.findByIdAndDelete(id);
          res.json(deleteBrand);
     } catch (error) {
          throw new Error(error);
     }
});
//------------------------------------------------------
//------------------------------------------------------
const getBrand=asyncHandler(async (req,res)=>{
     const { id } = req.params;
     validateMongoDbId(id);
     try {
          const findBrand= await Brand.findById(id);
          res.json(findBrand);
     } catch (error) {
          throw new Error(error);
     }
})
//------------------------------------------------------
//------------------------------------------------------
const hiddenBrand = asyncHandler(async (req, res) => {
     const {id}=req.params
     validateMongoDbId(id);
     try {
          const hiddenBrand = await Brand.findByIdAndUpdate(id,{status:0},{new: true});
          res.json(hiddenBrand);
     } catch (error) {
          throw new Error(error);
     }
})
//------------------------------------------------------
//------------------------------------------------------
const DisplayBrand = asyncHandler(async (req, res) => {
     const {id}=req.params
     validateMongoDbId(id);
     try {
          //get ctaegory by id and check if status is 0
          const brand = await Brand.findById(id);
          if(brand.status===0){
               const DisplayBrand = await Brand.findByIdAndUpdate(id,{status:1},{new: true});
               res.json(DisplayBrand);
          }else{
               res.status(400).json({msg:"Brand already displayed"})
          }
     } catch (error) {
          throw new Error(error);
     }
})
//------------------------------------------------------
//------------------------------------------------------
const SearchBrand = asyncHandler(async (req, res) => {
     const {search}=req.body 
     //validateString is a function that check if the string is empty or not
     if(!validateString(search)){
          return res.status(400).json({msg:"Error search not fucking valid"})
     }
     try {
          const brand = await Brand.find(
               {name:{
                    //regex is used to find the word in the string
                    $regex:search,
                    //options i is used to find the word in the string even if it is in uppercase or lowercase
                    $options:'i'
                    }
               });
          res.json(brand);
     } catch (error) {
          res.status(400).json({msg:error.message})
     }
})

module.exports={
     createBrand,
     getAllBrands,
     getBrand,
     updateBrand ,
     deleteBrand,
     hiddenBrand,
     DisplayBrand ,
     SearchBrand
}