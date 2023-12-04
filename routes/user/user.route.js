const userController = require('../../controllers/user/main.user.controller');
// const multer = require('multer');
// const path = require('path');

// const fileStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/profileImages');
//     },
//     filename: (req, file, cb) => {
//         cb(null, new Date().toISOString() + '-' + file.originalname);
//     }
// })

// const fileFilter = (req, file, cb) => {
//     if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
//         cb(null, true);
//     }
//     cb(null, false);
// }
// userRoute.post('/create', multer({ storage: fileStorage, fileFilter: fileFilter }).single('userImage'), userController.create);


const userRoute = require('express').Router();

userRoute.post('/create', userController.create);

userRoute.post('/update', userController.update);

userRoute.delete('/delete/:id',userController.delete);

userRoute.get('/getAll',userController.getAll);

userRoute.get('/getById/:id', userController.getById);

userRoute.get('/getSalesHead', userController.getSalesHead);

userRoute.get('/getCount',userController.getCount)

module.exports = userRoute;