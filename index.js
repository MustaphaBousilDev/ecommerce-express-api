const express=require('express')
const app=express()
const mongoose=require('mongoose')
const dotenv=require('dotenv').config()
//get db connection from config/dbConnect.js
require('./config/dbConnect')
const authRouter=require('./router/authRoute')
const productRouter=require('./router/productRoute')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const { notFound, errorHandler } = require('./middleware/errorHandler')
const PORT=process.env.PORT || 4000

//connect to db
app.use(bodyParser.json())
app.use(cookieParser());
//this is for form data 
app.use(bodyParser.urlencoded({ extended: false }))



app.use('/api/user',authRouter)
app.use('/api/product',productRouter)
//this is for not found
app.use(notFound)
//this is for error handler
app.use(errorHandler)

app.listen(PORT,()=>{
     console.log(`Server is running on port ${PORT}`)
})