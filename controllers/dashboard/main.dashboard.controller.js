const getLocationData = require("./locationData/locationData.dashboard.controller");
const getRecentProposalData = require("./recentProposal/recentProposal.dashboard.controller");
const getUserData = require("./userData/userData.dashboard.controller");
const proposalWithConflict = require('./proposalWithConflict/proposalWithConflict.dashboard.controller');
const recentProposalData = require('./recentProposalData/recentProposalData.dashboard.controller')
const getcenterData = require('./centerDataOnDashboard/centerData.dashboard.controller')
const getFloorData = require('./floorData/floordata.dashboard.controller');
const salesPersonProposalCount = require('./salesPersonProposalCount/salesPersonProposalCount.dashboard.controller')
const dashboardController = {
    userData: getUserData,
    recentProposal: getRecentProposalData,
    getLocationData: getLocationData,
    getcenterData:getcenterData,
    proposalWithConflict: proposalWithConflict,
    recentProposalData : recentProposalData,
    getFloorData:getFloorData,
    salesProposalCount:salesPersonProposalCount
    
}

module.exports = dashboardController;