const User=require('../model/userModel')
const asyncHandler=require('express-async-handler')
const {generateToken}=require('../config/jwtToken')
//get validation from helper
const {EmailValidator,PasswordValidator,LengthValidator,USernameValidator}=require('../helpers/validations')
const bcrypt=require('bcryptjs')
const createUser=asyncHandler(async (req,res)=>{
     const {first_name,last_name,username,email,mobile,password,picture}=req.body
     const emaild=await EmailValidator(email)
     const check=await User.findOne({email:email})
     if(check) throw new Error('email already exist')
     if(!LengthValidator(last_name,6,12)) return res.status(400).json({msg:'first name must be between 6 and 12 characters'})
     if(!LengthValidator(last_name,6,12)) return res.status(400).json({msg:'last name must be between 6 and 12 characters'})
     if(!LengthValidator(username,6,12)) return res.status(400).json({msg:'username must be between 6 and 12 characters'})
     if(!LengthValidator(password,8,20)) return res.status(400).json({msg:'password must be between 8 and 20 characters'})
     const salt=await bcrypt.genSaltSync(10)
     const cryptePassword=await bcrypt.hashSync(password,salt)
     let  tempUsername=first_name+last_name
     let  newUsername=await USernameValidator(tempUsername)
     const user=new User({first_name,last_name,username:newUsername,email,mobile,password:cryptePassword,picture})
     user.save().then((saveUser)=>{
               const token=generateToken({id:saveUser._id.toString()},"7d")
               res.status(200).json({msg:'user created',
               saveUser,
               token:token,
          })}).catch((error)=>{res.status(400).json({msg:error.message})})
}) 
const login=asyncHandler(async (req,res)=>{
     const {email,password}=req.body
     //check if email exist
     const findUser=await User.findOne({email:email})
     if(findUser && await findUser.isPasswordMatch(password,findUser.password)){
          res.status(200).json({
               _id:findUser?._id,
               first_name:findUser?.first_name,
               last_name:findUser?.last_name,
               username:findUser?.username,
               email:findUser?.email,
               mobile:findUser?.mobile,
               picture:findUser?.picture,
               role:findUser?.role,
               token:generateToken({id:findUser._id.toString()},"7d")
          })
     }else{
          throw new Error('invalid email or password')
     }
     

})
const getAllUsers=asyncHandler(async (req,res)=>{
     try{
          const users=await User.find()
          res.status(200).json({users})
     }catch(error){
          res.status(400).json({msg:error.message})
     }
})
const getUser=asyncHandler(async (req,res)=>{
     try{
          const {id}=req.params 
          const user=await User.findById(id)
          return res.status(200).json({user})
     }catch(error){
          res.status(400).json({message:'user not found'})
     }
})
const updateUser=asyncHandler(async (req,res)=>{
     const {id}=req.user
     try{ 
          const updateUser=await User.findByIdAndUpdate(id,{
               first_name:req?.body?.first_name,
               last_name:req?.body?.last_name,
               username:req?.body?.username,
               email:req?.body?.email,
               mobile:req?.body?.mobile,
               picture:req?.body?.picture,
               role:req?.body?.role,
          },{new:true})
          //check all fields change old value with new value
          

          res.status(200).json({msg:'user updated',updateUser})

     }catch(error){
          throw new Error(error.message)
     }


})
const blockUser=asyncHandler(async (req,res)=>{
     console.log(req.body)
})
const unblockUser=asyncHandler(async (req,res)=>{
     console.log(req.body)
})
module.exports={createUser,getAllUsers,login,getUser,updateUser,blockUser,unblockUser}