const { default: mongoose } = require("mongoose");
const Proposal = require("../../../models/proposal/proposal.model");

const proposalWithConflict = (req, res, next) => {
    try {
        let currentUser = req.user;
        if (currentUser.role === 'sales head') {
            Proposal.find().where('salesHead').equals(mongoose.Types.ObjectId(currentUser._id)).where('status').equals('Conflict').select('salesPerson clientName').populate('salesPerson','firstName lastName').then((proposalData) => {
                if (!proposalData) throw new Error('Something went wrong').status = 500;
                res.status(200).send(proposalData);
            }).catch((err) => {
                if (!err.message) err.message = 'Something went wrong';
                if (!err.status) err.status = 400;
                return next(err);
            })
        }
        else throw new Error('Unauthorized user').status = 401;
    }
    catch (err) {
        if (!err.message) err.message = 'Something went wrong';
        if (!err.status) err.status = 400;
        throw err;
    }
}

module.exports = proposalWithConflict;