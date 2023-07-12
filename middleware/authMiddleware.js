const User=require('../model/userModel')
const asyncHandler=require('express-async-handler')
const jwt=require('jsonwebtoken')

const authMiddleware=asyncHandler(async(req,res,next)=>{
     let token 
     if(req?.headers?.authorization?.startsWith('Bearer')){
          token=req.headers.authorization.split(' ')[1] 
          try {
               if(!token) {
                    return res.status(401).json({
                         success: false,
                         message: "Token Missing"
                    })
               }
               //verify token
               
               const decoded=jwt.verify(token,process.env.SECRET_KEY_TOKEN)
               const user=await User.findById(decoded.payload.id)
               if(!user) throw new Error('No user found with this id')
               req.user=user
               next()
          } catch (error) {
               return res.status(401).json({
                    success:false,
                    message: "Error Occured in Authentication ⚠️"
               })
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

const isEmployee=asyncHandler(async(req,res,next)=>{
     if(req.user && (req.user.role==='admin' || req.user.role==='employee')){
          next() 
     }else{
          res.status(401)
          throw new Error('Not authorized because you are not an employee')
     }
})

const isGood=asyncHandler(async(req,res,next)=>{
     if(req.user && req.user.role==='admin'){
          next() 
     }else{
          res.status(401)
          throw new Error('Not authorized because you are not an good')
     }
})



module.exports={authMiddleware,isAdmin,isGood}