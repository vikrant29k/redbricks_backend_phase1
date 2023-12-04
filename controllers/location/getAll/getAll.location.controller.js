const { default: mongoose } = require("mongoose");
const Location = require("../../../models/location/location.model")


const getAllLocation = (req, res, next) => {
    try {
        let currentUser = req.user;
        const allLocation = () => {
            if (currentUser.role === 'admin') {
                return Location.find();
            }
            else if (currentUser.role === 'sales head') {
                return Location.find().where('salesHead').equals(mongoose.Types.ObjectId(currentUser._id));
            }
            else {
                let error = new Error('Unauthorized!');
                error.status = 401;
                throw error;
            }
        }
        allLocation().then((location) => {
            if (!location) {
                let error = new Error('Error while getting all Location data');
                error.status = 503;
                throw error;
            }
            else {
                res.status(200).send(location);
            }
        }).catch((err) => {
            if (!err.message) err.message = 'Error while getting all location data';
            if (!err.status) err.status = 503;
            next(err);
        })
    }
    catch (err) {
        if (!err.message) err.message = 'Something went wrong';
        throw err;
    }
}

module.exports = getAllLocation;