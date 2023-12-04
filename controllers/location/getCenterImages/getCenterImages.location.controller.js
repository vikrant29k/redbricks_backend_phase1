const { default: mongoose } = require("mongoose");
const Location = require("../../../models/location/location.model");

const getCenterImages = async (req, res, next) => {
    // get id in params
    try {
        const Id = req.params.Id;
        if (!Id) {
            const error = new Error('Id not provided');
            error.status = 400;
            next(error);
        } else {
            // console.log(Id)
            if (mongoose.isValidObjectId(Id)) {
                const response = await Location.findById(mongoose.Types.ObjectId(Id)).select('centerImage')
                if (!response) {
                    let err = new Error("error while selecting images")
                    err.status = 503;
                    next(err)
                } else {
                    res.status(200).send(response.centerImage)
                }
            } else {
                const error = new Error("id not valid")
                error.status = 400
                next(error)
            }
        }
    } catch (err) {
        if (!err.message) err.message = 'Error while getting Images by ID';
        if (!err.status) err.status = 503;
        next(err)
    }
}

module.exports = getCenterImages;
