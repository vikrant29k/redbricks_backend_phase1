const { default: mongoose } = require("mongoose");
const Location = require("../../../models/location/location.model");
const fs = require('fs');
const path = require('path');


const deleteLocationData = (req, res, next) => {
    try {
        let Id = req.params.Id;
        if (!Id) {
            let error = new Error('Id not provided');
            error.status = 400;
            throw error;
        }
        else {
            Location.findById(mongoose.Types.ObjectId(Id)).then((locationData) => {
                if (!locationData) {
                    let error = new Error('invalid location Id');
                    error.status = 400;
                    throw error;
                }
                else {
                    Location.deleteOne({ _id: mongoose.Types.ObjectId(Id) }).then((result) => {
                        if (result.acknowledged) {
                            if (result.deletedCount > 0) {
                                // fs.unlink(locationData.jsonFile, (err) => {
                                //     if (err) {
                                //         return next(err);
                                //     }
                                //     else {
                                //         fs.unlink(locationData.layoutImage, (err) => {
                                //             if (err) {
                                //                 return next(err);
                                //             }
                                //             else {
                                //                 res.status(200).send({
                                //                     "Message": "Location Data removed successfully"
                                //                 })
                                //             }
                                //         })
                                //     }
                                // })
                                fs.unlinkSync(locationData.layoutImage);
                                locationData.centerImage?.forEach(imagePath => {
                                    fs.unlinkSync(imagePath); // Delete the file from the server
                                  });
                                // console.log(locationData, result)
                                res.status(200).send({
                                                        "Message": "Location removed successfully"
                                                    })
                            }
                            else {
                                let error = new Error('Something went wrong while removing location data');
                                error.status = 503;
                                throw error;
                            }
                        }
                        else {
                            let error = new Error('Something went wrong while removing location data');
                            error.status = 503;
                            throw error;
                        }
                    }).catch((err) => {
                        if (!err.message) err.message = 'Something went wrong while removing loation data';
                        if (!err.status) err.status = 503;
                        next(err);
                    })
                }
            }).catch((err) => {
                if (!err.message) err.message = 'Something went wrong while removing loation data';
                if (!err.status) err.status = 503;
                next(err);
            })
        }
    }
    catch (err) {
        if (!err.message) err.message = 'Error while removing location data';
        if (!err.status) err.status = 503;
        throw err;
    }
}

module.exports = deleteLocationData;