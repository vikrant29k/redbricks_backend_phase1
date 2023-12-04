const Location = require("../../../models/location/location.model")


const getLocationList = (req, res, next) => {
    Location.find({}, 'location ').distinct('location').then((locationList) => {
        if (!locationList) {
            let error = new Error('Error while getting location list');
            error.status = 503;
            throw error;
        }
        else {
            res.status(200).send(locationList);
        }
    }).catch((err) => {
        if (!err.message) err.message = 'Error while getting location list';
        if (!err.status) err.status = 503;
        next(err);
    })
}

module.exports = getLocationList;