const Proposal = require('../../../models/proposal/proposal.model');
const Location = require('../../../models/location/location.model');
const mongoose = require('mongoose');

const recentProposalData = async (req, res, next) => {
  const id = req.params.Id;
  const currentUser = req.user;

  try {
    if (currentUser.role === 'sales head' || currentUser.role === 'admin') {
      const data = await Proposal.findOne({ _id: id }).select('location center locationId floor totalNumberOfSeats clientFinalOfferAmmount previousFinalOfferAmmount Tenure LockIn depositTerm noticePeriod areaOfCoreSelectedSeat areaOfUsableSelectedSeat clientName')

      if (!data) {
        const error = new Error('No such proposal found');
        error.status = 404; 
        throw error;
      }
    const locationData = await Location.findOne({ _id: mongoose.Types.ObjectId(data.locationId) }).select('totalNoOfWorkstation selectedNoOfSeats bookingPriceUptilNow rackRate rackRateNS')
      
      let rackRateAsPerClient =Math.round(data.clientFinalOfferAmmount/data.totalNumberOfSeats);
      let updatingThePrice = locationData.bookingPriceUptilNow+data.clientFinalOfferAmmount
      let afterUpdate = Math.round(updatingThePrice/(locationData.selectedNoOfSeats+data.totalNumberOfSeats))
      let remainingSeats = locationData.totalNoOfWorkstation -locationData.selectedNoOfSeats
      let sendData = {
        ...data.toObject(), // Convert Mongoose document to plain JavaScript object
        rackRateAsPerClient: rackRateAsPerClient,
        bookingPriceUptilNow:locationData.bookingPriceUptilNow,
        updatingThePrice: updatingThePrice,
        afterUpdate: afterUpdate,
        remainingSeats : remainingSeats,
        totalNoOfWorkstation:locationData.totalNoOfWorkstation,
        systemRackRate:locationData.rackRate
      };
      // console.log(sendData)

      res.status(200).send(sendData);
    } else {
      const error = new Error('Not authorized');
      error.status = 401;
      throw error;
    }
  } catch (err) {
    if (!err.message) err.message = 'Something went wrong';
    next(err); // Pass the error to the error-handling middleware
  }
};

module.exports = recentProposalData;
