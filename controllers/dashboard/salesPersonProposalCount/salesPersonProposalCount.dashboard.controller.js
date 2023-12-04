const Proposal = require('../../../models/proposal/proposal.model')
const mongoose = require('mongoose')

const salesPersonProposalCount = async (req, res, next) => {
    let salesPersonID = req.params.Id
    try {
        const totalProposal = await Proposal.countDocuments({ salesPerson: mongoose.Types.ObjectId(salesPersonID) })
        const approveProposal = await Proposal.countDocuments({
            salesPerson: mongoose.Types.ObjectId(salesPersonID), $or: [
                { status: "Completed and approved" },
                { status: "Completed and Locked" }
            ]
        })
        if (!totalProposal) {
            let err = new Error("Proposal Not Found")
            err.status = 401;
            next(err)
        }
        res.status(200).json({ TotalProposals: totalProposal, ApproveProposals: approveProposal, InProgressProposals: totalProposal - approveProposal })
    } catch (err) {
        if(!err.message) err.message = "Something want Wrong"
        next(err)
    }
}

module.exports = salesPersonProposalCount;