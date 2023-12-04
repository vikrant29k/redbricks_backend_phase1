const express = require('express');
const router = express.Router();
const Location = require('../../../models/location/location.model'); // Update the path accordingly
const Proposal = require("../../../models/proposal/proposal.model")
// Get layoutBorder data by location ID

    const sendLayoutData = (req, res, next) => {
    try {
        const proposalId = req.params.Id;
       
        Proposal.findById(proposalId).then(proposal=>{
        
            Location.findOne({ location: proposal.location, center: proposal.center ,floor:proposal.floor }).then((locationdata) => {
                // const location = Location.findById(locationdata._id);

                if (!locationdata) {
                    return res.status(404).json({ message: 'Location not found' });
                }
        
                const layoutBorderData = locationdata.layoutBorder;
                // const seatSize= layoutBorderData[0].seatSize;
                // console.log(seatSize)
                // const shapeArray = [];
                
                    // Iterate through each layoutBorder object in the layoutBorderData
                //  for (const layoutBorderObj of layoutBorderData) {
                        // Iterate through each shape object in the layoutBorder object's layoutBorder array
                        // for (const shapeObj of layoutBorderObj.layoutBorder) {
                        //     shapeArray.push(JSON.parse(shapeObj.shape));
                        // }
                    // }

                    res.status(200).json({ locationId: locationdata._id, layoutArray:layoutBorderData });})
        })
        // Find the location by its ID
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = sendLayoutData;
