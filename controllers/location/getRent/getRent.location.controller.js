
const Location = require("../../../models/location/location.model");

const getRent = (req, res, next) => {
    let data = req.body;
    // console.log(data);
    try {
        Location.find({location:data.selectedLocation}&&{center:data.selectedCenter}).select('rentSheet').then((result) => {
                    // console.log(result);
                res.status(200).send(result);
                }).catch((err) => {
                    if (!err.message) err.message = 'Something went wrong';
                    return next(err);
                })
             
        }
        catch (err) {
            if (!err.message) err.message = 'Something went wrong';
            if (!err.status) err.status = 400;
            throw err;
        }
}

module.exports = getRent;