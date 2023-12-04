const Proposal = require("../../../models/proposal/proposal.model")

const checkSeatAvailabilityAndConsolidatedSeats = (req, res, next) => {
    try {
        let Id = req.params.Id;
        if (!Id) throw new Error('Id not Provided').status = 400;
        Proposal.findById(Id).select('seatAvailability consolidatedSeats totalNumberOfSeats location center locationId content').then((result) => {
            res.status(200).send(result);
        }).catch((err) => {
            if (!err.message) err.message = 'Something went wrong';
            return next(err);
        })
    }
    catch (err) {
        if (!err.message) err.message = 'Something went wrong';
        if (!err.status) err.status = 400;
        throw err;
    }
}

module.exports = checkSeatAvailabilityAndConsolidatedSeats;