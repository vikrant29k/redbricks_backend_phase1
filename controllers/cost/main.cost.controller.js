const updateCost = require("./update/update.cost.controller");
const getAllCost = require("./getAll/getAllCostSheet.cost.controller")

const costController = {
    getAll:getAllCost,
    update: updateCost
}

module.exports = costController;