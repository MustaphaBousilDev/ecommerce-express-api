const slugify = require("slugify");
const City=require('../model/citiesModel')
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
const  createCity=asyncHandler(async(req,res)=>{
     try{
          const {name,country}=req.body   
          const slug=slugify(name)
          req.body.slug=slug
          req.body.user=req.user._id
          validateMongoDbId(req.body.user)
          if(!validateString(name)){
               return res.status(400).json({msg:"Error title not fucking valid"})
          }
          const newCity=await City.create(req.body)     
          res.json(newCity)
     }catch(error){
          throw new Error(error)
     }
}) 
//-----------------------------------------------------
//------------------------------------------------------
const getAllCity=asyncHandler(async(req,res)=>{
     try{
          const queryObj = { ...req.query };
          console.log(queryObj)
          if(queryObj){
               //feltring 
               const excludeFields = ["page", "sort", "limit", "fields"];
               excludeFields.forEach((el) => delete queryObj[el]);
               let queryStr = JSON.stringify(queryObj);
               queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
               let query = City.find(JSON.parse(queryStr));
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
                    const cityCount = await City.countDocuments();
                    if (skip >= cityCount) throw new Error("This Page does not exists");
               }
               if(!req.query.page && !req.query.fields && !req.query.sort){
                    console.log('enter2')
                    const city=await City.find({})
                    //ppulate user and country
                    .populate({path:"user",select:"name email"})
                    .populate({path:"country",select:"name"})
                    res.json(city)
               }
               //--------------------------------------------------------
               // Execute the query
               const city = await query;
               res.json(city);
          }
          
     }catch(error){
          throw new Error(error)
     }
})
//------------------------------------------------------
//------------------------------------------------------
const updateCity = asyncHandler(async (req, res) => {
     const {id}=req.params 
     validateMongoDbId(id);
     console.log(id)
     try {
          req.body.slug = req.body.name && slugify(req.body.name);
          req.body.user_updated=req.user._id 
          let country=req?.body?.country
          const Cityupdated= await City.findByIdAndUpdate(id,{
               name:req?.body?.name,
               user_updated:req?.user?._id,
               slug:req?.body?.slug,
               status:req?.body?.status,
               country:country ? country : req?.body?.country
          },{new: true});

          
     res.json( Cityupdated);
     } catch (error) {
       res.status(400).json({msg:error.message});
     }
});
//------------------------------------------------------
//------------------------------------------------------
const deleteCity = asyncHandler(async (req, res) => {
     const {id}=req.params
     validateMongoDbId(id);
     try {
          const deleteCity = await City.findByIdAndDelete(id);
          res.json(deleteCity);
     } catch (error) {
          throw new Error(error);
     }
});
//------------------------------------------------------
//------------------------------------------------------
const getCity=asyncHandler(async (req,res)=>{
     const { id } = req.params;
     validateMongoDbId(id);
     try {
          const findCity= await City.findById(id);
          res.json(findCity);
     } catch (error) {
          throw new Error(error);
     }
})
//------------------------------------------------------
//------------------------------------------------------
const hiddenCity = asyncHandler(async (req, res) => {
     const {id}=req.params
     validateMongoDbId(id);
     try {
          const hiddenCity = await City.findByIdAndUpdate(id,{status:0},{new: true});
          res.json(hiddenCity);
     } catch (error) {
          throw new Error(error);
     }
})
//------------------------------------------------------
//------------------------------------------------------
const DisplayCity = asyncHandler(async (req, res) => {
     const {id}=req.params
     validateMongoDbId(id);
     try {
          //get ctaegory by id and check if status is 0
          const country = await City.findById(id);
          if(country.status===0){
               const DisplayCity = await City.findByIdAndUpdate(id,{status:1},{new: true});
               res.json(DisplayCity);
          }else{
               res.status(400).json({msg:"City already displayed"})
          }
     } catch (error) {
          throw new Error(error);
     }
})
//------------------------------------------------------
//------------------------------------------------------
const SearchCity = asyncHandler(async (req, res) => {
     const {search}=req.body 
     //validateString is a function that check if the string is empty or not
     if(!validateString(search)){
          return res.status(400).json({msg:"Error search not fucking valid"})
     }
     try {
          const city= await City.find(
               {name:{
                    //regex is used to find the word in the string
                    $regex:search,
                    //options i is used to find the word in the string even if it is in uppercase or lowercase
                    $options:'i'
                    }
               });
          res.json(city);
     } catch (error) {
          
          res.status(400).json({msg:error.message})
     }
})

module.exports={
     createCity,
     getAllCity,
     updateCity,
     deleteCity,
     getCity,
     hiddenCity,
     DisplayCity,
     SearchCity

}