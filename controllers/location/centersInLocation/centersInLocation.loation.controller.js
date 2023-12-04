const Location = require("../../../models/location/location.model")


const getCentersInLocation = (req, res, next) => {
    try {
        let location = req.params.location;
        if (!location) {
            let error = new Error('location not provided');
            error.status = 400;
            throw error;
        }
        // console.log(location);
        Location.find().select('center floor').where('location').equals(location).then((centersInLocation) => {
            if (!centersInLocation) {
                let error = new Error('Error while getting all the centers in selected location');
                error.status = 503;
                throw error;
            }
            else {
                const centerMap = new Map();

                // Iterate through the centersInLocation array
                centersInLocation.forEach((center) => {
                  // Check if the center name already exists in the centerMap
                  if (centerMap.has(center.center)) {
                    // If it exists, append the floor to the existing center's floor property
                    const existingCenter = centerMap.get(center.center);
                    existingCenter.floor.push(center.floor);
                  } else {
                    // If it doesn't exist, create a new center object with an array for the floor
                    centerMap.set(center.center, {
                      _id: center._id,
                      center: center.center,
                      selectedNoOfSeats: center.selectedNoOfSeats,
                      totalNoOfWorkstation: center.totalNoOfWorkstation,
                      floor: [center.floor]
                    });
                  }
                });
          
                // Convert the centerMap values back to an array
                const centersArray = Array.from(centerMap.values());
          
                res.status(200).send(centersArray);
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

module.exports = getCentersInLocation;