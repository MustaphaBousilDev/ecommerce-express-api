const multer = require('multer');
const storage = multer.diskStorage({
     destination: function (req, file, callback) {
          callback(null, './uploads');
     },
     filename: function (req, file, callback) {
          callback(null, Date.now() + file.originalname);
     },
});

//file validation
const fileFilter = (req, file, callback) => {
     //reject a file
     if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
          console.log('succees from multer about extention img')
          callback(null, true);
     } else {
          console.log('fucking failed  from multer about extention img')
          callback({message:'Unsupported File Format'}, false);
     }
}

const upload = multer({
     storage: storage,
     limits: {fieldSize: 1024 * 1024 * 3,},
     //fileFilter: fileFilter
});
module.exports =upload;