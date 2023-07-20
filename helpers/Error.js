// Custom Error class
module.exports = class AppError extends Error {
     constructor(message, statusCode) {
       //super is function used to call the cinstructur of the parent class(Error) 
       super(message);
       this.statusCode = statusCode;
       this.status = statusCode < 500 ? "error" : "fail";
   
       Error.captureStackTrace(this, this.constructor);
     }
   };