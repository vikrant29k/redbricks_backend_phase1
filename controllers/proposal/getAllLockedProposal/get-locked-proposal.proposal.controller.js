const Proposal = require("../../../models/proposal/proposal.model");

const getAllLockedProposal = (req, res, next) => {
    try {
        Proposal.find({ status: "Completed and Locked" }).then((lockedProposals) => {
            if (lockedProposals.length > 0) {
                res.status(200).send(lockedProposals);
            } else {
                let error = new Error('No completed and locked proposals found.');
                error.status = 404;
                throw error;
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

module.exports = getAllLockedProposal;
