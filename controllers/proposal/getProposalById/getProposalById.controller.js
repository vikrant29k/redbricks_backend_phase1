const Proposal = require("../../../models/proposal/proposal.model");


const getProposalById = (req, res, next) => {
    // console.log("call")
    let id = req.params.Id;
    try {
        Proposal.find().where('_id').equals(id).then((proposal) => {
            if (proposal) {
                res.status(200).send(proposal);
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

module.exports = getProposalById;