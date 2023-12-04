const salesHeadCentersReport = require("./shalesHeadWeaklyreport/shalesHeadCentersReport");
const salesHeadWeeklyReport = require("./shalesHeadWeaklyreport/shalesHeadWeeklyreport.sheduled");

const startSheduledTasks = () => {
    salesHeadWeeklyReport.start(); // sales head weekly report start;
    // salesHeadCentersReport.start(); 
}

module.exports = startSheduledTasks;