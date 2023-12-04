const getWeeklyReport = require('./weeklyReport.controller')
const getBrokerReport = require('./brokerReport.report')

const reportController = {
    getReport : getWeeklyReport,
    brokerReport: getBrokerReport
}

module.exports = reportController;