const createProposalLog = require('./create/create.proposal.log.controller');
const getAllProposalLog = require('./getAll/getAll.proposal.log.controller');
const updateProposalLog = require('./update/update.proposal.log.controller');


const proposalLog = {
    create: createProposalLog,
    update: updateProposalLog,
    getAll: getAllProposalLog
}

module.exports = proposalLog;