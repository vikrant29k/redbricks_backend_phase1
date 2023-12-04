const Proposal = require('../../../models/proposal/proposal.model');
const ProposalLog = require('../../../models/proposal-log/proposal-log.model');
const Location = require('../../../models/location/location.model');

const deleteProposal = async (req, res, next) => {
  const proposalId = req.params.Id;

  try {
    if (!proposalId) {
      let err = new Error("Enter Proposal Id");
      err.status = 401;
      throw err;
    } else {
      // Find the proposal first to get the location and totalSeats
      const proposal = await Proposal.findById(proposalId);

      if (!proposal) {
        let err = new Error('Error while deleting');
        err.status = 503;
        next(err);
      } else {
        const locationId = proposal.locationId;
        const totalSeatsToRemove = proposal.totalNumberOfSeats;
        const proposalPrice = proposal.finalOfferAmmount;
        // Delete the proposal
        const result = await Proposal.findByIdAndDelete(proposalId);

        if (!result) {
          let err = new Error('Error while deleting');
          err.status = 503;
          next(err);
        } else {
          // Find the location and its current selectedNoOfSeats
          const location = await Location.findById(locationId);
          const currentSelectedNoOfSeats = location.selectedNoOfSeats;
          const bookingPriceUptilNow = location.bookingPriceUptilNow
          const updatedPriceOfLoaction = bookingPriceUptilNow - proposalPrice
          // Calculate the updated selectedNoOfSeats by subtracting the totalSeatsToRemove
          const updatedSelectedNoOfSeats = currentSelectedNoOfSeats - totalSeatsToRemove;

          // Update the Location model with the new selectedNoOfSeats value
          await Location.findByIdAndUpdate(locationId, { $set: { selectedNoOfSeats: updatedSelectedNoOfSeats, bookingPriceUptilNow:updatedPriceOfLoaction } });

          // Update the ProposalLog
          const resp = await ProposalLog.updateOne(
            { proposalId: proposalId },
            { $set: { logMessage: 'Deleted' } }
          );

          if (!resp || resp == null) {
            let err = new Error('Error while updating Log');
            err.status = 503;
            next(err);
          } else {
            res.status(200).send({ message: 'Deleted Successfully' });
          }
        }
      }
    }
  } catch (err) {
    if (!err.message) err.message = 'error while deleting proposal';
    next(err);
  }
};

module.exports = deleteProposal;
