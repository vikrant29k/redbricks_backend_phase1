const express = require('express');
const Location = require('../../../models/location/location.model');

const recalculate=(async (req, res) => {
  try {
    // Retrieve the location data based on some identifier, like locationId
    const locationId = req.body.locationId; // You need to pass the locationId from the frontend
    const location = await Location.findById(locationId);
console.log("HELLOOOO",locationId)
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    // Recalculate values based on the updated rentandcam
    // ...

    // Update the calculated values in the location model
    // location.calculatedValue1 = /* new value */;
    // location.calculatedValue2 = /* new value */;

    // Save the updated location
    await location.save();

    return res.status(200).json({ message: 'Recalculation successful' });
  } catch (error) {
    console.error('Error during recalculation:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = recalculate;
