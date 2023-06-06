const slugify = require("slugify");
const Product=require('../model/productModel')
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



const createProduct=asyncHandler(async(req,res)=>{
     try{
          const {title,short_description,description,r_price,s_price,SKU,status,stock_total,bareCode,images,color,size,stock_status}=req.body   
          if(req.body.title) req.body.slug=slugify(req.body.title)
          if(!validateString(title)){return res.status(400).json({msg:"Error title not fucking valid"})}
          if(!validateString(description,10,400)){return res.status(400).json({msg:'invalid description'})}
          if(!validateString(short_description,10,100)){return res.status(400).json({msg:'invalud short description'})}
          if(!validateNumber(r_price)){return res.status(400).json({msg:'invalide regular price number'})}
          if(!validateNumber(s_price)){return res.status(400).json({msg:'invalide regular price number'})}
          if(!validateString(SKU)){return res.status(400).json({msg:'invalid sku'})}
          if(!validateStatus(status)){return res.status(400).json({msg:'status must nbe 0 or 1'})}
          if(!validateNumberIntegers(stock_total)){return res.status(400).json({msg:"invalid stock totak"})}
          if(!validateString(bareCode)){return res.status(400).json({msg:"invalid barcode"})}
          if(!validateColorEnum(color)){return res.status(400).json({msg:"invalid color your choose it"})}
          if(!validateSizeEnum(size)){return res.status(400).json({msg:'invalid size you choose it'})}
          if(!validateStatus(stock_status)){return res.status(400).json({msg:'invalid stock status'})}
          const newProduct=await Product.create(req.body)     
          res.json(newProduct)
     }catch(error){
          throw new Error(error)
     }
}) 
const updateProduct = asyncHandler(async (req, res) => {
     const id = req.params;
     validateMongoDbId(id);
     try {
       if (req.body.title) {
         req.body.slug = slugify(req.body.title);
       }

       const updateProduct = await Product.findOneAndUpdate({ id }, req.body, {
         new: true,
       });
       res.json(updateProduct);
     } catch (error) {
       throw new Error(error);
     }
   });
   const deleteProduct = asyncHandler(async (req, res) => {
     const id = req.params;
     validateMongoDbId(id);
     try {
       const deleteProduct = await Product.findOneAndDelete(id);
       res.json(deleteProduct);
     } catch (error) {
       throw new Error(error);
     }
   });
   const getaProduct = asyncHandler(async (req, res) => {
     const { id } = req.params;
     validateMongoDbId(id);
     try {
       const findProduct = await Product.findById(id);
       res.json(findProduct);
     } catch (error) {
       throw new Error(error);
     }
   });
   const getAllProduct = asyncHandler(async (req, res) => {
     try {
       // Filtering
       const queryObj = { ...req.query };
       const excludeFields = ["page", "sort", "limit", "fields"];
       excludeFields.forEach((el) => delete queryObj[el]);
       let queryStr = JSON.stringify(queryObj);
       queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
   
       let query = Product.find(JSON.parse(queryStr));
   
       // Sorting
   
       if (req.query.sort) {
         const sortBy = req.query.sort.split(",").join(" ");
         query = query.sort(sortBy);
       } else {
         query = query.sort("-createdAt");
       }
   
       // limiting the fields
   
       if (req.query.fields) {
         const fields = req.query.fields.split(",").join(" ");
         query = query.select(fields);
       } else {
         query = query.select("-__v");
       }
   
       // pagination
   
       const page = req.query.page;
       const limit = req.query.limit;
       const skip = (page - 1) * limit;
       query = query.skip(skip).limit(limit);
       if (req.query.page) {
         const productCount = await Product.countDocuments();
         if (skip >= productCount) throw new Error("This Page does not exists");
       }
       const product = await query;
       res.json(product);
     } catch (error) {
       throw new Error(error);
     }
   });
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
const searchProducts=asyncHandler(async(req,res)=>{})
const getProductsAvailable=asyncHandler(async(req,res)=>{})
const getProductsNotAvailable=asyncHandler(async(req,res)=>{})
const getProductsDeleted=asyncHandler(async(req,res)=>{})
const getProductsNotDeleted=asyncHandler(async(req,res)=>{})


module.exports={
     createProduct
}