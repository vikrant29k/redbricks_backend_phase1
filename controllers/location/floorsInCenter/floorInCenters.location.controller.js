const Location = require("../../../models/location/location.model")


const getFloorsInCenter = (req, res, next) => {
    try {
        let floor = req.params.floor;
        // console.log("CENTER NAME ======>",floor)
        if (!floor) {
            let error = new Error('Center not provided');
            error.status = 400;
            throw error;
        }
        // console.log(location);
        Location.find().select('totalNoOfWorkstation selectedNoOfSeats floor').where('center').equals(floor).then((floorsInLocation) => {
            // console.log(floorsInLocation[0])
            if (!floorsInLocation) {
                let error = new Error('Error while getting all the centers in selected location');
                error.status = 503;
                throw error;
            }
            else {
          
                res.status(200).send(floorsInLocation);
              }
  }).catch((err) => {
            if (!err.message) err.message = 'Error while getting all the centers in selected location';
            if (!err.status) err.status = 503;
            next(err);
        })
    }
    catch (err) {
        if (!err.message) err.message = 'Error while getting all the centers in selected location';
        if (!err.status) err.status = 503;
        throw err;
    }
}

module.exports = getFloorsInCenter;