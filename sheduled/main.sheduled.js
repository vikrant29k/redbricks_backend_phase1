const salesHeadCentersReport = require("./shalesHeadWeaklyreport/shalesHeadCentersReport");
const salesHeadWeeklyReport = require("./shalesHeadWeaklyreport/shalesHeadWeeklyreport.sheduled");
const updateRentAndCamYearly = require("./updateRentAndCamAfterYearCompletion/updateRentAndCamCron.sheduler")
const startSheduledTasks = () => {
    salesHeadWeeklyReport.start(); // sales head weekly report start;
    updateRentAndCamYearly.start();
    // salesHeadCentersReport.start(); 
}

module.exports = startSheduledTasks;