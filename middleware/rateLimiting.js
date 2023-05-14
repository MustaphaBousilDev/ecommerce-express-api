const RateLimit = require('express-rate-limit');
// Rate limiting middleware to prevent brute-force attacks

const ApiRateLimiter = RateLimit({
     windowMs: 60 * 1000, // 1 minute
     max: 5, // max 5 attempts(tries)
     message: 'Too many attempts, please try again after some time'
   });
   
   module.exports = ApiRateLimiter;