const Location = require("../../../models/location/location.model");
const fs = require('fs')
const createLocation = async (req,res,next) => {
    try {
        let data = req.body;
        // console.log(data)
        // console.log('Location added=>>',data)
        // let jsonFile = req.files['jsonFile'][0];
        let layoutImage = req.files['layoutImage'][0];
        let centerImage = req.files['centerImage'];
        // if (!jsonFile && !layoutImage) {
            if (!layoutImage) {
            let error = new Error('Please upload layout Image');
            error.status = 400;
            throw error;
        }
        else {

            if (layoutImage) data.layoutImage = layoutImage.path;
            if(centerImage) data.centerImage = centerImage.path;
            if (centerImage) {
                data.centerImage = centerImage.path;
                data.centerImage= centerImage.map(image => image.path) 
            }
            // console.log(data);
            // if (data.imageLinks === '{}') {
            //     delete data.imageLinks;
            // }
            // else {
            //     data.imageLinks = Object.values(JSON.parse(data.imageLinks));
            // }
            // if (data.videoLinks === '{}') {
            //     delete data.videoLinks;
            // }
            // else {
            //     data.videoLinks = Object.values(JSON.parse(data.videoLinks));
            // }
            if(data.rentSheet === '{}'){
                delete data.rentSheet;
            }
            else{
                data.rentSheet = Object.values(JSON.parse(data.rentSheet));
            }
            if(data.selectedNoOfSeats==''){
                data.selectedNoOfSeats = 0
            }
            // console.log(data)
            Location.findOne().where('location').equals(data.location).where('center').equals(data.center).where('floor').equals(data.floor).then((result) => {
                if (result) {
                    let error = new Error('Location Already Exists');
                    error.status = 400;
                    throw error;
                }
                else {
                    let location = new Location(data);
                    location.save().then((result) => {
                        if (!result) {
                            let error = new Error('Error while adding location');
                            error.status = 401;
                            throw error;
                        }
                        else {
                           
                    
                            res.status(202).send({
                                "data": result,
                                "Message": "Location added Successfully"
                            })
                        }
                    }).catch((err) => {
                        if (!err.message) err.message = 'Error while adding location';
                        if (!err.status) err.status = 503;
                        next(err);
                    })
                }
            }).catch((err) => {
                if (!err.message) err.message = 'Error while adding location';
                if (!err.status) err.status = 503;
                next(err);
            })
        }
    }
    catch (err) {
        if (!err.message) err.message = 'Error while adding location';
        throw err;
    }
}

module.exports = createLocation;