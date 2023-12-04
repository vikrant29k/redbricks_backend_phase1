const ProposalLog = require("../../../../models/proposal-log/proposal-log.model");

const updateProposalLog = (proposalId, logData) => {
    logData = {...logData, updatedAt: new Date()}

    ProposalLog.updateOne({ proposalId }, logData).catch((err) => {
        throw err;
    })
}

module.exports = updateProposalLog;