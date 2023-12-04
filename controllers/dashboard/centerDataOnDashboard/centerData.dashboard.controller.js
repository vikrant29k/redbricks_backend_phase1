const Location = require("../../../models/location/location.model");


const getCenterData = async (req, res, next) => {
    try {
      const locationName = req.params.locationName; // Assuming you pass the location name as a URL parameter
      // Search for centers with the same location name
      const centers = await Location.find({ location: locationName }).distinct('center');
  
      if (centers.length === 0) {
        return res.status(404).json({ message: "No centers found for the given location name." });
      }

      // Send the centers as a JSON response
      res.json({ centers,locationName });
    } catch (error) {
      // Handle errors appropriately (e.g., send an error response)
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  
  module.exports = getCenterData;
  

module.exports = getCenterData;