// const { default: mongoose } = require("mongoose");
// const Location = require("../../../models/location/location.model");
// const fs = require('fs');
// const path = require('path');
// const { json } = require("express");


// const updateLocationData = (req, res, next) => {
//     Id = req.params.Id;
//     let data = req.body;
//     let jsonUpdated = false;
//     let layoutImageUpdated = false;
//     let centerImageUpdated = false;
//     try {
//         if (!Id) {
//             let error = new Error('Id not provided');
//             error.status = 400;
//             throw error;
//         }
//         else {
//             Location.findById(mongoose.Types.ObjectId(Id)).then((locationData) => {
//                 // if (req.files['jsonFile'] || req.files['layoutImage']) {
//                 if (req.files['layoutImage']) {
//                     // if (req.files['jsonFile']) {
//                     //     fs.unlinkSync(locationData.jsonFile);
//                     //     data.jsonFile = req.files['jsonFile'][0].path;
//                     //     jsonUpdated = true;
//                     //     // fs.unlink(locationData.jsonFile, (err) => {
//                     //     //     if (err) throw err;
//                     //     //     data.jsonFile = req.files['jsonFile'][0].path;
//                     //     // })
//                     // }
//                     if (req.files['layoutImage']) {
//                         fs.unlinkSync(locationData.layoutImage);
//                         data.layoutImage = req.files['layoutImage'][0].path;
//                         layoutImageUpdated = true;
//                     }
//                 }
//                 if (req.files['centerImage']) {
//                     locationData.centerImage?.map(image => fs.unlinkSync(image))
//                     data.centerImage = centerImage.path;
//                     data.centerImage = centerImage.map(image => image.path)
//                     centerImageUpdated = true;
//                     console.log(data)
//                 }

//                 if (data.location !== locationData.location || data.center !== locationData.center || data.floor !== locationData.floor) {
//                     // if (!jsonUpdated) {
//                     //     fs.renameSync(locationData.jsonFile, path.join('assets', 'layout', 'json', `${data.location}_${data.center}_${data.floor}.json`));
//                     //     data.jsonFile = path.join('assets', 'layout', 'json', `${data.location}_${data.center}_${data.floor}.json`);                            
//                     // }
//                     if (!layoutImageUpdated) {
//                         // fs.renameSync(locationData.layoutImage, path.join('assets', 'layout', 'image', `${data.location}_${data.center}_${data.floor}.png`));
//                         // data.layoutImage = path.join('assets', 'layout', 'image', `${data.location}_${data.center}_${data.floor}.png`);
//                         const prefix = req.body.location + '_' + req.body.center + '_' + req.body.floor;
//                         const uniqueFileName = `${prefix}_${Date.now()}.${file.mimetype.split('/')[1]}`;
//                         fs.renameSync(locationData.layoutImage, path.join('assets', 'location', 'centerImages'`${prefix}_${uniqueFileName}.png`))
//                         data.layoutImage =path.join('assets', 'location', 'centerImages'`${prefix}_${uniqueFileName}.png`)
//                     }

//                     // fs.rename(locationData.layoutImage, path.join('assets', 'layout', 'image', `${data.location}_${data.center}.png`), (err) => {
//                     //     if (err) throw err;
//                     //     data.layoutImage = path.join('assets', 'layout', 'image', `${data.location}_${data.center}.png`);
//                     // })
//                 }

//                 if (data.imageLinks === '{}') {
//                     delete data.imageLinks;
//                 }
//                 else {
//                     data.imageLinks = Object.values(JSON.parse(data.imageLinks));
//                 }
//                 // if (data.videoLinks === '{}') {
//                 //     delete data.videoLinks;
//                 // }
//                 // else {
//                 //     data.videoLinks = Object.values(JSON.parse(data.videoLinks));
//                 // }
//                 if (data.rentSheet === '{}') {
//                     delete data.rentSheet;
//                 }
//                 else {
//                     data.rentSheet = Object.values(JSON.parse(data.rentSheet));
//                 }
//             }).then(() => {
//                 // console.log('Update Data::', data);
//                 Location.updateOne({ _id: mongoose.Types.ObjectId(Id) }, { $set: data }).then((result) => {
//                     if (result.acknowledged) {
//                         if (result.modifiedCount > 0) {
//                             res.status(202).send({
//                                 "Message": "Location Data updated successfully"
//                             })
//                         }
//                         else {
//                             let error = new Error('Error while updating location data');
//                             error.status = 503;
//                             throw error;
//                         }
//                     }
//                     else {
//                         let error = new Error('Error while updating location data');
//                         error.status = 503;
//                         throw error;
//                     }
//                 }).catch((err) => {
//                     if (!err.message) err.message = 'Something went wrong while updation location data';
//                     if (!err.status) err.status = 503;
//                     next(err);
//                 })
//             }).catch((err) => {
//                 if (!err.message) err.message = 'Error while detecting what was updated in location data';
//                 if (!err.status) err.status = 503;
//                 next(err);
//             })
//         }
//     }
//     catch (err) {
//         if (!err.message) err.message = 'Error while updating location Data';
//         if (!err.status) err.status = 503;
//         throw err;
//     }
// }

const { default: mongoose } = require("mongoose");
const Location = require("../../../models/location/location.model");
const fs = require('fs');
const path = require('path');
const { json } = require("express");


const updateLocationData = (req, res, next) => {
    Id = req.params.Id;
    let data = req.body;
    let jsonUpdated = false;
    let layoutImageUpdated = false;
    try {
        if (!Id) {
            let error = new Error('Id not provided');
            error.status = 400;
            throw error;
        }
        else {
            Location.findById(mongoose.Types.ObjectId(Id)).then((locationData) => {

                // if (req.files['jsonFile'] || req.files['layoutImage']) {
                // if (req.files['layoutImage']) {
                // if (req.files['jsonFile']) {
                //     fs.unlinkSync(locationData.jsonFile);
                //     data.jsonFile = req.files['jsonFile'][0].path;
                //     jsonUpdated = true;
                //     // fs.unlink(locationData.jsonFile, (err) => {
                //     //     if (err) throw err;
                //     //     data.jsonFile = req.files['jsonFile'][0].path;
                //     // })
                // }
                if (req.files['layoutImage']) {
                    // fs.unlinkSync(locationData.layoutImage);
                    data.layoutImage = req.files['layoutImage'][0].path;
                    layoutImageUpdated = true;
                }
                if (req.files['centerImage']) {
                    // if (centerImage) {
                    data.centerImage = req.files['centerImage'].path;
                    data.centerImage = [...locationData.centerImage, ...req.files['centerImage'].map(image => image.path)]
                    // }
                }
                // }

                if (data.location !== locationData.location || data.center !== locationData.center || data.floor !== locationData.floor) {
                    // if (!jsonUpdated) {
                    //     fs.renameSync(locationData.jsonFile, path.join('assets', 'layout', 'json', `${data.location}_${data.center}_${data.floor}.json`));
                    //     data.jsonFile = path.join('assets', 'layout', 'json', `${data.location}_${data.center}_${data.floor}.json`);                            
                    // }

                    // const layoutImgUpdate = () => {
                    //     if (!layoutImageUpdated) {
                    //         fs.renameSync(locationData.layoutImage, path.join('assets', 'layout', 'image', `${data.location}_${data.center}_${data.floor}.png`));
                    //         data.layoutImage = path.join('assets', 'layout', 'image', `${data.location}_${data.center}_${data.floor}.png`);
                    //     }
                    // }

                    // fs.rename(locationData.layoutImage, path.join('assets', 'layout', 'image', `${data.location}_${data.center}.png`), (err) => {
                    //     if (err) throw err;
                    //     data.layoutImage = path.join('assets', 'layout', 'image', `${data.location}_${data.center}.png`);
                    // })
                }

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
                if (data.rentSheet === '{}') {
                    delete data.rentSheet;
                }
                else {
                    data.rentSheet = Object.values(JSON.parse(data.rentSheet));
                }
                return locationData;
            }).then((loc) => {

                    const update = () => {
                        Location.updateOne({ _id: mongoose.Types.ObjectId(Id) }, { $set: data }).then((result) => {
                            if (result.acknowledged) {
                                if (result.modifiedCount > 0) {
                                    res.status(202).send({
                                        "Message": "Location Data updated successfully"
                                    })
                                }
                                else {
                                    let error = new Error('Error while updating location data');
                                    error.status = 503;
                                    throw error;
                                }
                            }
                            else {
                                let error = new Error('Error while updating location data');
                                error.status = 503;
                                throw error;
                            }
                        }).catch((err) => {
                            if (!err.message) err.message = 'Something went wrong while updation location data';
                            if (!err.status) err.status = 503;
                            next(err);
                        })
                    }
                    if (data.location === loc?.location && data.center === loc?.center && data.floor === loc?.floor) {
                        // console.log("not Edit")
                        // layoutImgUpdate()
                        if (req.files['layoutImage']) {
                        fs.unlinkSync(loc.layoutImage)
                        }
                        update();
                    }
                    else {
                        // console.log("edit")
                        Location.findOne().where('location').equals(data.location).where('center').equals(data.center).where('floor').equals(data.floor).then((duplicate) => {
                            if (duplicate) {
                                // console.log(duplicate)
                                let err = new Error("Location Already Exist")
                                err.status = 409
                                next(err)
                            }
                            else {
                                // layoutImgUpdate()
                                if (req.files['layoutImage']) {
                                fs.unlinkSync(loc.layoutImage)
                                }
                                update();
                            }
                        }).catch((err) => {
                            if (!err.message) err.message = 'Something went wrong while updating user!';
                            if (!err.status) err.status = 400;
                            next(err);
                        })
                    }
                    // console.log('Update Data::', data);
               
            }).catch((err) => {
                if (!err.message) err.message = 'Error while detecting what was updated in location data';
                if (!err.status) err.status = 503;
                next(err);
            })
        }
    }
    catch (err) {
        if (!err.message) err.message = 'Error while updating location Data';
        if (!err.status) err.status = 503;
        throw err;
    }
}

module.exports = updateLocationData;

// module.exports = updateLocationData;