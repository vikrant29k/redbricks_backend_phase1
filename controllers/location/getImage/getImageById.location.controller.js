const { default: mongoose } = require("mongoose");
const Location = require("../../../models/location/location.model");

const getLayoutImageById = (req, res, next) => {
    try {
        const Id = req.params.Id;
        if (!Id) {
            const error = new Error('Id not provided');
            error.status = 400;
            throw error;
        } else {
            if (mongoose.isValidObjectId(Id)) {
                Location.findById(mongoose.Types.ObjectId(Id))
                    .select('layoutImage') // Select only the layoutImage field
                    .then((location) => {
                        if (!location) {
                            const error = new Error('Error while getting image of selected location');
                            error.status = 503;
                            throw error;
                        } else {
                            let data=String(location.layoutImage)
                            res.status(200).send(data); // Send the layoutImage field
                        }
                    }).catch((err) => {
                        if (!err.message) err.message = 'Something went wrong while getting image of selected location';
                        if (!err.status) err.status = 503;
                        next(err);
                    })
            } else {
                const error = new Error('Invalid location Id');
                error.status = 400;
                throw error;
            }
        }
    } catch (err) {
        if (!err.message) err.message = 'Error while getting Image by ID';
        if (!err.status) err.status = 503;
        throw err;
    }
}

module.exports = getLayoutImageById;
