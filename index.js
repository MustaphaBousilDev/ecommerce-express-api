const express=require('express')
const app=express()
const mongoose=require('mongoose')
const dotenv=require('dotenv').config()
//get db connection from config/dbConnect.js
require('./config/dbConnect')
const authRouter=require('./router/authRoute')
const productRouter=require('./router/productRoute')
const categoryRouter=require('./router/categoryRoute')
const subCategoryRouteer=require('./router/subCategoryRoute')
const brandRouter=require('./router/brandRoute')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const { notFound, errorHandler } = require('./middleware/errorHandler')
const { authMiddleware } = require('./middleware/authMiddleware')
const PORT=process.env.PORT || 4000

//connect to db
app.use(bodyParser.json())
app.use(cookieParser());
//this is for form data 
app.use(bodyParser.urlencoded({ extended: false }))


 
app.use('/api/user',authRouter)
app.use('/api/product',authMiddleware,productRouter)
app.use('/api/category',authMiddleware,categoryRouter)
app.use('/api/subcategory',authMiddleware,subCategoryRouteer)
app.use('/api/brands',authMiddleware,brandRouter)
//this is for not found
app.use(notFound)
//this is for error handler
app.use(errorHandler)

app.listen(PORT,()=>{
     console.log(`Server is running on port ${PORT}`)
})