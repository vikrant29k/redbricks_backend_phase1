const reportController = require('../../controllers/weekly report/main.report.controller');
const middleware = require('../../middlewares/main.middlewares')

const reportRoute = require('express').Router();

reportRoute.post('/generateReport', reportController.getReport);
reportRoute.get('/brokerReport', middleware.authentication, reportController.brokerReport)

module.exports = reportRoute;