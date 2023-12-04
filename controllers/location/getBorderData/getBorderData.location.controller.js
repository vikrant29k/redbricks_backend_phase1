const { default: mongoose } = require("mongoose");
const Location = require("../../../models/location/location.model");

const getBorderDataById = (req, res, next) => {
    try {
        const Id = req.params.Id;
        if (!Id) {
            const error = new Error('Id not provided');
            error.status = 400;
            throw error;
        } else {
            if (mongoose.isValidObjectId(Id)) {
                Location.findById(mongoose.Types.ObjectId(Id))
                    .select('layoutBorder totalNoOfWorkstation selectedNoOfSeats') // Select only the layoutBorder field
                    .then((location) => {
                        if (location.layoutBorder.length==0) {
                            // console.log("No Data in layoutBorder")
                            res.status(200).send({Message:'No data'})
                        } else {
                            let data=location.layoutBorder;
                           
                            // console.log(location)
                            res.status(200).send({layoutArray:data,totalNoOfWorkstation:location.totalNoOfWorkstation-location.selectedNoOfSeats}); // Send the layoutdata field
                         
                        }
                    }).catch((err) => {
                        if (!err.message) err.message = 'Something went wrong while getting data of selected location';
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

module.exports = getBorderDataById;
