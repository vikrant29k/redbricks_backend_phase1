const proposalCount = require('./proposalCount/proposalCount.brokerDashboard.controller')
const averageProposalPerMonth = require('./averageProposalPerMonth/averageProposalPerMonth.brokerDashboard.controller')
const highproposalsLocations = require('./highProposalLocations/highProposalLocations.brokerDashboard.controller')
const highProposalSalesperson = require('./highProposalSalesPerson/highProposalsSalesperson.brokerdashboard.controller')

const brokerDashboardController ={
proposalCount:proposalCount,
averageProposalPerMonth:averageProposalPerMonth,
highproposalsLocations:highproposalsLocations,
highProposalSalesperson:highProposalSalesperson
}

module.exports = brokerDashboardController