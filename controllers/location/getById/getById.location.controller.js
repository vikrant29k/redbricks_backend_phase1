const { default: mongoose } = require("mongoose");
const Location = require("../../../models/location/location.model");


const getLocationById = (req, res, next) => {
    try {
        let Id = req.params.Id;
        if (!Id) {
            let error = new Error('Id not provided');
            error.status = 400;
            throw error;
        }
        else {
            if (mongoose.isValidObjectId(Id)) {
                Location.findById(mongoose.Types.ObjectId(Id)).then((location) => {
                    if (!location) {
                        let error = new Error('Error while getting all data of selected location');
                        error.status = 503;
                        throw error;
                    }
                    else {
                        res.status(200).send(location);
                    }
                }).catch((err) => {
                    if (!err.message) err.message = 'Something went wrong while geting data about selected location';
                    if (!err.status) err.status = 503;
                    next(err);
                })
            }
            else {
                let error = new Error('Invalid location Id');
                error.status = 400;
                throw error;
            }
        }
    }
    catch (err) {
        if (!err.message) err.message = 'Error while getting location by ID';
        if (!err.status) err.status = 503;
        throw err;
    }
}

module.exports = getLocationById;