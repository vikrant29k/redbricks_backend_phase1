const { default: mongoose } = require("mongoose");
const Location = require("../../../models/location/location.model");
const Proposal = require("../../../models/proposal/proposal.model"); // Import the Proposal model

const getLocationData = (req, res, next) => {
  try {
    const currentUser = req.user;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1); // Calculate yesterday

    const dayBeforeYesterday = new Date();
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2); // Calculate the day before yesterday

    const findLocation = () => {
      if (currentUser.role === 'admin') {
        return Location.find().select('location center floor availableNoOfWorkstation systemPrice totalNoOfWorkstation selectedNoOfSeats rentAndCamTotal rackRate bookingPriceUptilNow totalProposals futureRackRate currentRackRate');
      } else if (currentUser.role === 'sales head') {
        return Location.find().select('location center floor availableNoOfWorkstation systemPrice totalNoOfWorkstation selectedNoOfSeats rentAndCamTotal rackRate bookingPriceUptilNow totalProposals futureRackRate currentRackRate');
      } else {
        let error = new Error('not Authorized');
        error.status = 401;
        throw error;
      }
    };

    findLocation()
      .then(async (locations) => {
        if (!locations) {
          let error = new Error('Something went wrong');
          throw error;
        } else {
          let locationData = [];
          locations = JSON.parse(JSON.stringify(locations));

          // Initialize an empty object to store the structured data
          const structuredData = {};

          // Fetch proposal counts for each location
          for (const location of locations) {
            const totalNoOfWorkstation = locations
            .filter((loc) => loc.location === location.location)
            .reduce((acc, loc) => acc + loc.totalNoOfWorkstation, 0);
        
            const proposalCountToday = await Proposal.countDocuments({
              location: location.location,
              createdAt: {
                $gte: new Date().setHours(0, 0, 0, 0),
                $lt: new Date().setHours(23, 59, 59, 999),
              },
            });

            const proposalCountYesterday = await Proposal.countDocuments({
              location: location.location,
              createdAt: {
                $gte: yesterday.setHours(0, 0, 0, 0),
                $lt: yesterday.setHours(23, 59, 59, 999),
              },
            });

            const proposalCountDayBeforeYesterday = await Proposal.countDocuments({
              location: location.location,
              createdAt: {
                $gte: dayBeforeYesterday.setHours(0, 0, 0, 0),
                $lt: dayBeforeYesterday.setHours(23, 59, 59, 999),
              },
            });

            if (!structuredData[location.location]) {
              structuredData[location.location] = {
                location: location.location,
                // totalNoOfWorkstation: location.totalNoOfWorkstation,
                totalNoOfWorkstation, 
                selectedNoOfSeats: location.selectedNoOfSeats,
                systemPrice: location.systemPrice,
                bookingPriceUptilNow: location.bookingPriceUptilNow,
                totalProposals: location.totalProposals,
                proposalsData: {
                  today: proposalCountToday,
                  yesterday: proposalCountYesterday,
                  dayBeforeYesterday: proposalCountDayBeforeYesterday,
                },
              };
            }
          }

          // Convert the structuredData object to an array
          locationData = Object.values(structuredData);

          res.json(locationData);
        }
      })
      .catch((err) => {
        if (!err.message) err.message = 'Something went wrong';
        return next(err);
      });
  } catch (err) {
    if (!err.message) err.message = 'Something went wrong';
    throw err;
  }
};

module.exports = getLocationData;
