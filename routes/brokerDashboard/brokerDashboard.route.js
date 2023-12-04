const brokerDashboardController = require('../../controllers/brokerDashboard/main.brokerDashboard.controller')

const brokerDashboardRoute = require('express').Router()

brokerDashboardRoute.get('/proposalCount/:Id', brokerDashboardController.proposalCount)
brokerDashboardRoute.post('/average/:Id', brokerDashboardController.averageProposalPerMonth)
brokerDashboardRoute.get('/locations/:Id',brokerDashboardController.highproposalsLocations)
brokerDashboardRoute.get('/salesPersons/:Id',brokerDashboardController.highProposalSalesperson)

module.exports = brokerDashboardRoute;