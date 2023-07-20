const slugify = require("slugify");
const Category=require('../model/categoryProductModel')
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
const createCategory=asyncHandler(async(req,res)=>{
     try{
          const {name}=req.body   
          const slug=slugify(name)
          req.body.slug=slug
          req.body.user=req.user._id
          if(!validateString(name)) return res.status(400).json({msg:"Error title not fucking valid"})
          const newCategory=await Category.create(req.body)     
          res.json(newCategory)
     }catch(error){
          throw new Error(error)
     }
}) 
//-----------------------------------------------------
//------------------------------------------------------
const getAllCategory=asyncHandler(async(req,res)=>{
     try{
          const queryObj = { ...req.query };
          if(queryObj){
               //feltring 
               const excludeFields = ["page", "sort", "limit", "fields"];
               excludeFields.forEach((el) => delete queryObj[el]);
               let queryStr = JSON.stringify(queryObj);
               queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
               let query = Category.find(JSON.parse(queryStr));
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
                    const categoytCount = await Category.countDocuments();
                    if (skip >= categoytCount) throw new Error("This Page does not exists");
               }
               //--------------------------------------------------------
 



               const categories = await query;
               res.json(categories);
          }else{
               const category=await Category.find({}).populate('user')
               res.json(category)
          }
     }catch(error){
          throw new Error(error)
     }
})
//--------------------------------------------------------
//-----------------------------------------------------------------
const updateCategory = asyncHandler(async (req, res) => {
     const {id}=req.params 
     validateMongoDbId(id);
     try {
     if (req.body.name) {
          req.body.slug = slugify(req.body.name);
     }
     req.body.user_updated=req.user._id 
     const categoryupdated= await Brand.findByIdAndUpdate(id,{
          name:req?.body?.name,
          user_updated:req?.user?._id,
          slug:req?.body?.slug,
          status:req?.body?.status,
     },{new: true});
     res.json(categoryupdated);
     } catch (error) {
       throw new Error(error);
     }
});
//-----------------------------------------------------------------
//-----------------------------------------------------------------
const deleteCategory = asyncHandler(async (req, res) => {
     const {id}=req.params
     validateMongoDbId(id);
     try {
          const deleteCategory = await Category.findOneAndDelete(id);
          res.json(deleteCategory);
     } catch (error) {
          throw new Error(error);
     }
});
//-----------------------------------------------------------------
//-----------------------------------------------------------------
const hiddenCategory = asyncHandler(async (req, res) => {
     const {id}=req.params
     validateMongoDbId(id);
     try {
          const hiddenCategory = await Category.findOneAndUpdate(id,{status:0},{new: true});
          res.json(hiddenCategory);
     } catch (error) {
          throw new Error(error);
     }
})
//-----------------------------------------------------------------
const DisplayCategory = asyncHandler(async (req, res) => {
     const {id}=req.params
     validateMongoDbId(id);
     try {
          //get ctaegory by id and check if status is 0
          const category = await Category.findById(id);
          if(category.status===0){
               const DisplayCategory = await Category.findOneAndUpdate(id,{status:1},{new: true});
               res.json(DisplayCategory);
          }else{
               res.status(400).json({msg:"Category already displayed"})
          }
     } catch (error) {
          throw new Error(error);
     }
})
//-----------------------------------------------------------------
const SearchCategory = asyncHandler(async (req, res) => {
     const {search}=req.body 
     //validateString is a function that check if the string is empty or not
     if(!validateString(search)){
          return res.status(400).json({msg:"Error search not fucking valid"})
     }
     try {
          const category = await Category.find(
               {name:{
                    //regex is used to find the word in the string
                    $regex:search,
                    //options i is used to find the word in the string even if it is in uppercase or lowercase
                    $options:'i'
                    }
               });
          res.json(category);
     } catch (error) {
          res.status(400).json({msg:error.message})
     }
})
//-----------------------------------------------------------------
const getCategory=asyncHandler(async (req,res)=>{
     const { id } = req.params;
     validateMongoDbId(id);
     try {
          const findCategory = await Category.findById(id);
          res.json(findCategory);
     } catch (error) {
          throw new Error(error);
     }
})
//-----------------------------------------------------------------

const addToWishlist = asyncHandler(async (req, res) => {
const { _id } = req.user;
const { prodId } = req.body;
try {
     const user = await User.findById(_id);
     const alreadyadded = user.wishlist.find((id) => id.toString() === prodId);
     if (alreadyadded) {
     let user = await User.findByIdAndUpdate(
          _id,
          {
          $pull: { wishlist: prodId },
          },
          {
          new: true,
          }
     );
     res.json(user);
     } else {
     let user = await User.findByIdAndUpdate(
          _id,
          {
          $push: { wishlist: prodId },
          },
          {
          new: true,
          }
     );
     res.json(user);
     }
} catch (error) {
     throw new Error(error);
}
});
const rating = asyncHandler(async (req, res) => {
const { _id } = req.user;
const { star, prodId, comment } = req.body;
try {
     const product = await Product.findById(prodId);
     let alreadyRated = product.ratings.find(
     (userId) => userId.postedby.toString() === _id.toString()
     );
     if (alreadyRated) {
     const updateRating = await Product.updateOne(
          {
          ratings: { $elemMatch: alreadyRated },
          },
          {
          $set: { "ratings.$.star": star, "ratings.$.comment": comment },
          },
          {
          new: true,
          }
     );
     } else {
     const rateProduct = await Product.findByIdAndUpdate(
          prodId,
          {
          $push: {
          ratings: {
               star: star,
               comment: comment,
               postedby: _id,
          },
          },
          },
          {
          new: true,
          }
     );
     }
     const getallratings = await Product.findById(prodId);
     let totalRating = getallratings.ratings.length;
     let ratingsum = getallratings.ratings
     .map((item) => item.star)
     .reduce((prev, curr) => prev + curr, 0);
     let actualRating = Math.round(ratingsum / totalRating);
     let finalproduct = await Product.findByIdAndUpdate(
     prodId,
     {
          totalrating: actualRating,
     },
     { new: true }
     );
     res.json(finalproduct);
} catch (error) {
     throw new Error(error);
}
});

module.exports={
     createCategory,
     getAllCategory,
     updateCategory,
     deleteCategory,
     hiddenCategory,
     DisplayCategory,
     SearchCategory,
     getCategory,
}