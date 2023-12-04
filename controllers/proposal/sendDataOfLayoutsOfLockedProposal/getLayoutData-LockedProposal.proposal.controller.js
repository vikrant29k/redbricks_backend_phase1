const Proposal = require("../../../models/proposal/proposal.model");

const getLayoutDataByLocationId = (req, res, next) => {
    const locationId = req.params.Id;

    try {
        Proposal.find({ locationId, status: "Completed and Locked" }).then((lockedProposals) => {
            if (lockedProposals.length > 0) {
                const responseData = lockedProposals.map((proposal) => {
                    return {
                        seatSize: proposal.seatSize,
                        seatsData: proposal.seatsData,
                        clientName: proposal.clientName,
                        totalNumberOfSeats: proposal.totalNumberOfSeats,
                        color:proposal.color
                    };
                });
                res.status(200).send(responseData);
            }else{
                res.status(200).send({Message:'No Data'})
            }
        }).catch((err) => {
            if (!err.status) err.status = 400;
            next(err);
        });
    } catch (err) {
        if (!err.status) err.status = 400;
        next(err);
    }
};

module.exports = getLayoutDataByLocationId;
