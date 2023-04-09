const {default : mongoose}=require('mongoose');

mongoose.connect(process.env.CONNECTION_MONGOs,{
     useNewUrlParser:true
     })
     .then(()=>console.log('Database Successfuly Connected'))
     .catch((err)=>console.log('error connectly to mongodb',err))


module.exports=mongoose