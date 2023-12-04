const Location = require("../../../models/location/location.model");
const Proposal = require("../../../models/proposal/proposal.model");

const getFloorData = async (req, res, next) => {
  try {
    const locationName = req.params.locationName; // Location name from the URL parameter
    const centerName = req.params.centerName; // Center name from the URL parameter

    // Search for floors that match the given location and center names
    const floors = await Location.find({ location: locationName, center: centerName }).select(
      'floor selectedNoOfSeats totalNoOfWorkstation bookingPriceUptilNow totalProposals rackRate currentRackRate systemPrice'
    );

    if (floors.length === 0) {
      return res.status(404).json({ message: "No floors found for the given location and center names." });
    }

    // Initialize an array to store formatted floor data
    const formattedData = [];

    // Count the number of finalized proposals for all floors
    const proposalCounts = await Promise.all(
      floors.map(async (floor) => {
        return Proposal.countDocuments({
          location: locationName,
          center: centerName,
          floor: floor.floor,
          status: "Completed and Locked",
        });
      })
    );

    // Populate the formattedData array with the floor data and proposal counts
    floors.forEach((floor, index) => {
      formattedData.push({
        floorName: floor.floor,
        floorData: {
          systemPrice: floor.systemPrice,
          selectedNoOfSeats: floor.selectedNoOfSeats,
          totalNoOfWorkstation: floor.totalNoOfWorkstation,
          bookingPriceUptilNow: floor.bookingPriceUptilNow,
          totalProposals: floor.totalProposals,
          rackRate: floor.rackRate,
          currentRackRate: floor.currentRackRate,
          finalizedProposal: proposalCounts[index],
        },
      });
    });

    // Send the formatted data along with the finalizedProposal object as a JSON response
    res.json({ data: formattedData });

  } catch (error) {
    // Handle errors appropriately (e.g., send an error response)
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = getFloorData;
