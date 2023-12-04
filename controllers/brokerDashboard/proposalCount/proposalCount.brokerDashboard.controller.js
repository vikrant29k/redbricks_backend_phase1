const Proposal = require('../../../models/proposal/proposal.model');
const Broker = require('../../../models/broker/broker.model')
const mongoose = require('mongoose');

const proposalCount = async (req, res, next) => {
    try {
        const brokerId = req.params.Id;
        const brokerData = await Broker.findOne({ _id: mongoose.Types.ObjectId(brokerId) }).catch((err) => {
            if (!err.message) err.message = 'Something went wrong';
            return next(err);
        })
        const totalProposalCount = await Proposal.countDocuments({ brokerCategory: mongoose.Types.ObjectId(brokerId) }).catch((err) => {
            if (!err.message) err.message = 'Something went wrong';
            return next(err);
        })
        const approveProposalCount = await Proposal.countDocuments({
            brokerCategory: mongoose.Types.ObjectId(brokerId),
            $or: [
                { status: "Completed and approved" },
                { status: "Completed and Locked" },
            ],
        }).catch((err) => {
            if (!err.message) err.message = 'Something went wrong';
            return next(err);
        })

        if (totalProposalCount === 0) {
            let error = new Error('No Proposals Found');
            return next(error);
        }

        const inProgressProposalCount = totalProposalCount - approveProposalCount;
        let editBrokerdata = brokerData.toObject();
        editBrokerdata.totalProposalCount = totalProposalCount
        editBrokerdata.approveProposalCount = approveProposalCount
        editBrokerdata.inProgressProposalCount = inProgressProposalCount
        // console.log(editBrokerdata)
        res.status(200).send(editBrokerdata);
    } catch (err) {
        if (!err.message) err.message = 'Something went wrong';
        next(err);
    }
};

module.exports = proposalCount;
