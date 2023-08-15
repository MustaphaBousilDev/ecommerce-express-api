const slugify = require("slugify");
const Product=require('../model/productModel')
const Colors=require('../model/colorsModel')
const Sizes=require('../model/sizesModel')
const Tags=require('../model/tagsProduct')
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
          const {title,short_description,description,r_price,s_price,
          SKU,stock_total,bareCode,sizes,made,subCategory,brand,tags}=req.body  
          console.log(tags)
          req.body.user=req.user._id
          
          if(req.body.title) req.body.slug=slugify(req.body.title)
          if(!validateString(title)){return res.status(400).json({msg:"Error title not fucking valid"})}
          if(!validateString(description,10,400)){return res.status(400).json({msg:'invalid description'})}
          if(!validateString(short_description,10,100)){return res.status(400).json({msg:'invalud short description'})}
          if(!validateNumber(r_price)){return res.status(400).json({msg:'invalide regular price number'})}
          if(!validateNumber(s_price)){return res.status(400).json({msg:'invalide regular price number'})}
          if(!validateString(SKU)){return res.status(400).json({msg:'invalid sku'})}
          if(!validateNumberIntegers(stock_total)){return res.status(400).json({msg:"invalid stock totak"})}
          if(!validateString(bareCode)){return res.status(400).json({msg:"invalid barcode"})}
          validateMongoDbId(made)
          validateMongoDbId(req.body.user)
          validateMongoDbId(subCategory)
          validateMongoDbId(brand)
          
          //validate unique title 
          const titleDB=await Product.findOne({title})
          if (titleDB) return res.status(400).json({msg:'this title is exists, change it!'})


          const newProduct=await Product.create({
            title:title,
            slug:req.body.slug,
            short_description:short_description,
            description:description,
            r_price:r_price,
            s_price:s_price,
            SKU:SKU,
            stock_total:stock_total,
            bareCode:bareCode,
            made:made,
            subCategory:subCategory,
            brand:brand,
            user:req.user._id
          })   
          //upddate sizes of products 
          let ProductAll
          for (const size of sizes) {
            const updatedColors = size.colors.map(color => ({
              color: color.color,
              quantity: color.quantity
            }));
            ProductAll=await Product.findByIdAndUpdate(
              newProduct._id,
              {
                $push: {
                  SizesColors: {
                    size: size.size,
                    colors: updatedColors
                  }
                }
              },
              { new: true } // To return the updated document
            );
          }
          //update product in sizes 
          sizes.forEach(async(size)=>{
            //validation size
            validateMongoDbId(size.size)
            updateSize=await Sizes.findByIdAndUpdate(size.size,{$push:{products:newProduct._id}})
            size.colors.forEach(async(color)=>{
              validateMongoDbId(color.color)
              updateSize=await Sizes.findByIdAndUpdate(size.size,{
                $push:{
                  colors:color.color,
                }
              })
              updateColor=await Colors.findByIdAndUpdate(color.color,{
                $push:{
                  sizes:{
                    size:size.size,
                    quantity:color.quantity,
                    product:newProduct._id,
                  }
                }
              })
            })            
          })
          //res.json(newProduct)
          //store tags in  tags collection
          let newTag
          let co=0
          tags.forEach(async(tag)=>{
            if(!validateString(tag)){return res.status(400).json({msg:"invalid tag"})}
            let findTags=await Tags.findOne(
              {
                name:tag,
              }
            )
            if(findTags){
               //get id of this tag and update in product
                id=findTags._id
                ProductAll=await Product.findByIdAndUpdate(newProduct._id,{$push:{tags:findTags._id}})
            }else{
              newTag=await Tags.create({
                name:tag,
                products:newProduct._id,
                slug:slugify(tag),
                user:req.user._id
              })
              ProductAll=await Product.findByIdAndUpdate(newProduct._id,{$push:{tags:newTag._id}})
            }
            co++
            if(co==tags.length){
              res.json(ProductAll)
            }
            //update tags in product
          })
          //update tags in product
          //res.json(ProductAll)

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