const User=require('../model/userModel')

const EmailValidator=(email)=>{
     let check= String(email)
     .toLowerCase()
     .match(/^([a-z\d.-]+)@([a-z\d-]+)\.([a-z]{2,12})(\.[a-z]{2,12})?$/)
     if(!check){
          throw new Error('email is not valid')
     }
}

const PasswordValidator=(password)=>{
     return String(password)
     .match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)
}

const LengthValidator=(text,min,max)=>{
     if(text.length > max || text.length < min){return false}
     return true
}

const USernameValidator=async (username)=>{
     let  change=false 
     do{
          let check=await User.findOne({username:username}) 
          if(check){
               username+=(+new Date() * Math.random()).toString().substring(0,1)
               change=true
          }else{change=false}
     }while(change)
     return username
}


module.exports={
     EmailValidator,
     PasswordValidator,
     LengthValidator,
     USernameValidator
}