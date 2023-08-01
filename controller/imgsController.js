
const cloudinary=require('../helpers/cloudinary')

const Images=require('../model/imagesModel')
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
const  createImgsProduct=asyncHandler(async(req,res)=>{
     try{
          let pictureFiles = req.files;
          if (!pictureFiles){
             return res.status(400).json({ message: "No picture attached!" });
          }
          
          let multiplePicturePromise = pictureFiles.map((picture) =>
                  cloudinary.v2.uploader.upload(picture.path)
          );
          let imgs=[]
          let counter=0
          
             let imageResponses = await Promise.all(multiplePicturePromise);
             imageResponses.map((imageResponse)=>{
                  let keyImgs={
                       picture:imageResponse.secure_url,
                       cloudinary_id:imageResponse.public_id,
                       user:req.user._id
                  }
                  imgs[counter]=keyImgs
                  counter++
             })
             //save images in database
             const images=await Images.insertMany(imgs)
             //return id of this images 
             const ids=images.map((image)=>image._id)
          //remove file from server
          pictureFiles.map((picture) => fs.unlinkSync(picture.path))
          res.status(200).json({ images: ids });
       }catch(err){
           res.status(500).json({
             message: err.message,
           });
       }
}) 

const getAllImgsProduct=asyncHandler(async(req,res)=>{
     try{
          const allImgs=await Images.find({},{
               _id:1,
               picture:1,
               cloudinary_id:1,
               status:1,
               user:1,
               user_updated:

               {
                    $cond: { if: { $eq: [ "$user_updated", null ] }, then: 0, else: 1 }
               },
               createdAt:1,
          }).populate('user',{
               _id:1,
               email:1
          })
          res.json(allImgs)
     }catch(error){
          throw new Error(error)
     }
})
const updateImgsProduct = asyncHandler(async (req, res) => {
     const {id}=req.params 
     let picture =req.file;
     validateMongoDbId(id);
     try{
          const img=await Images.findById(id)
          const cloudinary_ids=img.cloudinary_id
          //delete from cloudinary 
          cloudinary.uploader.destroy(cloudinary_ids)
          const result = await cloudinary.uploader.upload(picture.path);
          const imgsUpdated=await Images.findByIdAndUpdate(id,{
               picture:result.secure_url,
               cloudinary_id:result.public_id,
               user_updated:req.user._id,
               
          },{new: true})
          fs.unlinkSync(picture.path);
          res.json(imgsUpdated)
     } catch (error) {
       throw new Error(error);
     }
});

module.exports={
     createImgsProduct,
     getAllImgsProduct,
     updateImgsProduct
}