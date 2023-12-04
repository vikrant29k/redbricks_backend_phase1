const ProposalLog = require("../../../../models/proposal-log/proposal-log.model")

const createProposalLog = ({ proposalId, clientName, salesPerson, location, center, salesHead, floor  }) => {
    let proposalLogData = {
        proposalId,
        logMessage: 'Initialized with client Info',
        clientName,
        salesPerson,
        location,
        center,
        floor,
        salesHead
    }
    let proposalLog = new ProposalLog(proposalLogData);
    proposalLog.save().then((result) => {
        // console.log('Log Generated::', result);
    }).catch((err) => {
        // console.log(err);
    })
}

module.exports = createProposalLog;