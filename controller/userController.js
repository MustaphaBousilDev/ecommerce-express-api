const User=require('../model/userModel')


const createUser=async (req,res)=>{
     console.log('hello')
     const email=req.body.email 
     console.log(email)
     const findUser=await User.find({email:email})
     if(!findUser){
          //create new user 
          const newUser=User.create(req.body)
          res.json(newUser)
     }else{
          res.json({success:false,message:'user already exists'})

     }
}



module.exports={createUser}