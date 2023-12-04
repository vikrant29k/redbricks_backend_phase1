const Proposal = require("../../../models/proposal/proposal.model");


const getAllProposal = (req, res, next) => {
    let salesPerson = req.user._id;
    try {
        Proposal.find().where('salesPerson').equals(salesPerson).nor([{status: 'In-Progress'}]).populate('brokerCategory','brokerCategory').then((allProposal) => {
            if (allProposal) {
                res.status(200).send(allProposal);
            }
            else {
                let error = new Error('Something went wrong ')
            }
        }).catch((err) => {
            if (!err.status) err.status = 400;
            next(err);
        })
    }
    catch (err) {
        if (!err.status) err.status = 400;
        throw err;
    }
}

module.exports = getAllProposal;