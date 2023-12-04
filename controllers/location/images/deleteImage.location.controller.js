const Location = require('../../../models/location/location.model')
const mongoose = require('mongoose');
const fs = require('fs');

const deleteImage = (req, res, next) => {
    let id = req.params.Id;
    let data = req.body;
    if (!id) {
        let err = new Error("id not provided")
        err.status = 403;
        throw err;
    } else {
        // console.log(data, id)
        Location.updateOne({_id:mongoose.Types.ObjectId(id)}, {$pull:{centerImage:{$in: [data.imgPath]}}}).then((updateResult) => {
            if(updateResult.acknowledged && updateResult.modifiedCount === 1){
                fs.unlink(data.imgPath,(err) => {
                    if(err) {
                        Location.updateOne({_id:mongoose.Types.ObjectId(id)},{$push: {centerImage: data.imgPath}}).then((updateResult) => {
                            if(updateResult.acknowledged && updateResult.modifiedCount === 1){
                                throw {message: 'Something went wrong'}
                            }
                        }).catch((err) => {
                            return next(err);
                        })
                    }
                    else{
                        res.status(200).json({Message: 'Image removed successfully'});
                    }
                })
            }
            else throw {message: 'Something went wrong'};
        }).catch((err) => {
            return next(err);
        })
    }
}
module.exports = deleteImage;