const locationController = require('../../controllers/location/main.location.controller');
const Location = require('../../models/location/location.model')
const locationRoute = require('express').Router();
const multer = require('multer');
const path = require('path');
const middleware = require('../../middlewares/main.middlewares');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // if (file.mimetype === 'application/json') {
        //     cb(null, path.join('assets','layout','json'));
        // }
        if (file.fieldname === 'layoutImage' && file.mimetype === 'image/png') {
            cb(null, path.join('assets', 'layout', 'image'));
        }
        else if (file.fieldname === 'centerImage' && file.mimetype === 'image/png') {
            cb(null, path.join('assets', 'location', 'centerImages'));
        }
        // console.log(req.body.location,req.body.center,req.body.floor,file.mimetype)\
    },
    filename: async (req, file, cb) => {
        let data = req.body;
        let locationId = req.params.Id;
        console.log(req.body, req.params);

        // if(!locationId) {
        const location = await Location.findOne().where('location').equals(data.location).where('center').equals(data.center).where('floor').equals(data.floor)
        // console.log('LOCATION ==> ', location);
        if (location) {
            console.log('LOCATION_ID ==> ', location._id.toString(), locationId, location._id.toString() !== locationId);
            if (location._id.toString() !== locationId) {
                return cb({ message: 'Location Already Exists' })
            }
        }
        // }
        if (file.fieldname === 'centerImage') {
            const prefix = req.body.location + '_' + req.body.center + '_' + req.body.floor;
            const uniqueFileName = `${prefix}_${Date.now()}.${file.mimetype.split('/')[1]}`;
            cb(null, uniqueFileName);
        }
        else if (file.fieldname === 'layoutImage') {
            const prefix = req.body.location + '_' + req.body.center + '_' + req.body.floor;
            const uniqueFileName = `${prefix}_${Date.now()}.${file.mimetype.split('/')[1]}`;
            cb(null, uniqueFileName);
            // cb(null, `${req.body.location}_${req.body.center}_${req.body.floor}.${file.mimetype.split('/')[1]}`);
        }
        // cb(null, `${req.body.location}_${req.body.center}_${req.body.floor}.${file.mimetype.split('/')[1]}`);
        // Location.findOne().where('location').equals(data.location).where('center').equals(data.center).where('floor').equals(data.floor).then((result) => {
        //     if (result) {
        //         let error = new Error('Location Already Exists');
        //         error.status = 400;
        //         throw (error);
        // res.send("location already Exist")
        // }
        // else {

        // const prefix = req.body.location + '_' + req.body.center + '_' + req.body.floor;
        // // cb(null, `${prefix}_${file.fieldname}.${file.mimetype.split('/')[1]}`);
        // const prefix = req.body.location + '_' + req.body.center + '_' + req.body.floor;
        // const uniqueFileName = `${prefix}_${Date.now()}.${file.mimetype.split('/')[1]}`;
        // cb(null, uniqueFileName);
        // }
        // }).
        //     catch((err) => {
        //         if (!err.message) err.message = 'Location Already Exists';
        //         // throw err;
        //         cb(err, null);
        //     })
    }

});

const fileFilter = (req, file, cb) => {
    // if (file.mimetype === 'application/json' || file.mimetype === 'image/png') {
    if (file.mimetype === 'image/png') {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
}

// const layoutImageFileFilter = (req, file, cb) => {
//     if (file.mimetype === 'image/png') {
//         cb(null, true);
//     }
//     cb(null, false);
// }

locationRoute.post('/create', middleware.checkAdminAuthorization, multer({ storage: fileStorage, fileFilter: fileFilter }).fields([{ name: 'layoutImage', maxCount: 1 }, { name: 'centerImage', maxCount: 10 }]), locationController.create);

locationRoute.post('/update/:Id', middleware.checkAdminAuthorization, multer({ storage: fileStorage, fileFilter: fileFilter }).fields([{ name: 'layoutImage', maxCount: 1 }, { name: 'centerImage', maxCount: 10 }]), locationController.update);

locationRoute.delete('/delete/:Id', middleware.checkAdminAuthorization, locationController.delete);

locationRoute.get('/getAll', locationController.getAll);

locationRoute.get('/getById/:Id', locationController.getById);

locationRoute.get('/getLocationList', locationController.getLoctionList);

locationRoute.get('/getCentersInLocation/:location', locationController.getCentesInLocation);

locationRoute.post('/getRentSheet', locationController.getRentSheet);

locationRoute.post('/updateRackValue', locationController.updateRackValue);

locationRoute.get('/getImage/:Id', locationController.getImage);

locationRoute.get('/getFloorsInLocation/:floor', locationController.getFloorsInCenter)

locationRoute.post('/addLayout/:Id', locationController.addLayout);

locationRoute.get('/getBorderData/:Id', locationController.getBorder);

locationRoute.get('/getCenterImages/:Id', locationController.getCenterImages);

locationRoute.post('/deleteImg/:Id', locationController.deleteImage);

module.exports = locationRoute;