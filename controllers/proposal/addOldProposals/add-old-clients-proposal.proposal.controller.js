const Proposal = require("../../../models/proposal/proposal.model");
const Location = require("../../../models/location/location.model");
const { default: mongoose } = require("mongoose");

const addOldClientProposals = (req, res, next) => {
  try {
    const data = req.body;
    // console.log(data.location, data.center, data.floor);

    // Check if a previous proposal exists with the same criteria
    Proposal.findOne({
      clientName: data.clientName,
      location: data.location,
      center: data.center,
      floor: data.floor,
      totalNumberOfSeats: data.totalNumberOfSeats,
    }).then((existingProposal) => {
      if (existingProposal) {
        // A previous proposal with the same criteria exists
        // You can choose to handle this case as needed (e.g., return an error)
        return res.status(409).json({
          message: "A previous proposal with the same criteria already exists.",
        });
      } else {
        // No previous proposal found with the same criteria, continue with proposal creation

        let date = new Date();
        let Id = `RBO${String(data.location).toUpperCase().slice(0, 2)}${String(
          data.center
        ).toUpperCase().slice(0, 2)}${("0" + date.getDate()).slice(-2)}${(
          "0" +
          (date.getMonth() + 1)
        ).slice(-2)}${("0" + date.getHours()).slice(-2)}${(
          "0" +
          date.getMinutes()
        ).slice(-2)}`;

        const proposal = new Proposal({
          _id: String(Id),
          clientName: data.clientName,
          location: data.location,
          locationId: data.locationId,
          center: data.center,
          floor: data.floor,
          finalOfferAmmount: data.finalOfferAmmount,
          salesPerson: mongoose.Types.ObjectId(data.salesPerson),
          salesHead: mongoose.Types.ObjectId(data.salesHead),
          tenure: data.tenure,
          lockIn: data.lockIn,
          depositTerm: data.depositTerm,
          noticePeriod: data.noticePeriod,
          rentCommencmentDate: data.rentCommencmentDate,
          NonStandardRequirement: data.NonStandardRequirement,
          Serviced: data.Serviced,
          totalNumberOfSeats: data.totalNumberOfSeats,
          color: data.color,
          seatSize: data.seatSize,
          seatsData: data.seatsData,
          status: data.status,
        });

        proposal.save().then((result) => {
          if (result) {
            Location.findByIdAndUpdate(data.locationId, {
              $inc: { selectedNoOfSeats: data.totalNumberOfSeats },
            })
              .then((resp) => {
                res.status(200).send({ _id: result._id });
              })
              .catch((error) => {
                // Handle the error as needed
                next(error);
              });
          }
        });
      }
    });
  } catch (err) {
    if (!err.status) err.status = 500;
    if (!err.message) err.message = "Error while submitting";
    throw err;
  }
};

module.exports = addOldClientProposals;
