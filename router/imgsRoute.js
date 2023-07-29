const express=require('express')
const {authMiddleware,isAdmin, isGood}=require('../middleware/authMiddleware')

const upload=require('../middleware/multer')
const cloudinary=require('../helpers/cloudinary')
//fs is file system using for delete file from server
const fs=require('fs')
const router=express.Router()

/*router.post('/',upload.array('picture'), async (req,res)=>{

     try{
               let urls = [];
               let c=0
               const uploader = req.files.map(async (file) => {
                    
                    await cloudinary.uploads(file.path);
                    urls.push({url:file.path})
                    fs.unlinkSync(file.path)
                    c++
                    
               });
               uploader()
               
     }catch(error){
          console.error('Error uploading images:', error);
          res.status(500).json({
               message: 'An error occurred while uploading images',
               error: error.message
          });
     }
})*/

router.post("/",isAdmin, upload.array("picture"), async (req, res) => {

    try{
       let pictureFiles = req.files;
       if (!pictureFiles){
          return res.status(400).json({ message: "No picture attached!" });
       }
       let multiplePicturePromise = pictureFiles.map((picture) =>
               cloudinary.v2.uploader.upload(picture.path)
       );
       let imageResponses = await Promise.all(multiplePicturePromise);
       //remove file from server
       pictureFiles.map((picture) => fs.unlinkSync(picture.path))
       res.status(200).json({ images: imageResponses });
    }catch(err){
        res.status(500).json({
          message: err.message,
        });
    }
  });

//filtering and sorting category


module.exports=router