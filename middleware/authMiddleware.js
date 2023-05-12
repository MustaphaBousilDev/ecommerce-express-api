const User=require('../model/userModel')
const asyncHandler=require('express-async-handler')
const jwt=require('jsonwebtoken')

const authMiddleware=asyncHandler(async(req,res,next)=>{
     let token 
     if(req?.headers?.authorization?.startsWith('Bearer')){
          token=req.headers.authorization.split(' ')[1]
          try {
               if(!token) throw new Error('Not authorized,no token')
               const decoded=jwt.verify(token,process.env.SECRET_KEY_TOKEN)
               console.log(decoded)
               const user=await User.findById(decoded.payload.id)
               if(!user) throw new Error('No user found with this id')
               req.user=user
               next()
          } catch (error) {
               res.status(401)
               throw new Error('Not authorized,token failed')
          }
     }else{
          res.status(401)
          throw new Error('Not authorized,no token')
     }
})

const isAdmin=asyncHandler(async(req,res,next)=>{
     if(req.user && (req.user.role==='admin' 
          || req.user._id.toString()===req.params.id.toString())){
          next() 
     }else{
          res.status(401)
          throw new Error('Not authorized as an admin or user is not authorized to get his own profile')
     }
})



module.exports={authMiddleware,isAdmin}