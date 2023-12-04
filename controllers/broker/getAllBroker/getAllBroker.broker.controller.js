const Broker = require("../../../models/broker/broker.model");
const Proposal = require('../../../models/proposal/proposal.model')
const mongoose = require('mongoose')

const getAllBroker = async (req, res, next) => {
    try {
        const brokerData = await Broker.find()
        if (!brokerData) {
            let error = new Error('Something went wrong');
            throw error;
        }
        var brokerdata = []
        // brokerData.forEach((broker) => {

        //     Proposal.countDocuments({
        //         brokerCategory: mongoose.Types.ObjectId(broker._id)
        //     }).then((total)=>{
        //         brokerdata.push({"_id":broker,"Total Proposals": total});
        //     })
        //     Proposal.countDocuments({
        //         brokerCategory: mongoose.Types.ObjectId(broker._id)
        //     }).then((approve)=>{
        //     })
        // })
        // console.log(brokerdata)
        await Promise.all(brokerData.map(async (broker) => {
            const totalProposals = await Proposal.countDocuments({
                brokerCategory: mongoose.Types.ObjectId(broker._id)
            })
            const approveProposals = await Proposal.countDocuments({
                brokerCategory: mongoose.Types.ObjectId(broker._id), $or: [
                    { status: "Completed and approved" },
                    { status: "Completed and Locked" }]
            })
            const brokerObject = broker.toObject();
            brokerObject.inProgress = totalProposals-approveProposals;
            brokerObject.approveProposal = approveProposals;
            // console.log(brokerObject)
            brokerdata.push(brokerObject);
        }));

        if (brokerdata.length === 0) {
            const error = new Error("Broker not Found")
            throw (error)
        }
        res.status(200).send(brokerdata);
    } catch (err) {
        if (!err.message) err.message = 'Something went wrong';
        if (!err.status) err.status = 500;
        next(err);
    }
}

module.exports = getAllBroker;