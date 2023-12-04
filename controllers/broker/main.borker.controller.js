const createBroker = require("./create/create.broker.controller");
const getAllBroker = require("./getAllBroker/getAllBroker.broker.controller");
const getAllBrokerTypeList = require("./getBrokerTypeList/getAllBrokerTypeList.broker.controller");
const getBrokerCategoryList = require('./getBrokerCategoryList/getBrokerCategoryList.broker.controller');
const getBrokerById = require("./getById/getById.broker.controller");
const deleteBroker = require("./delete/delete.broker.controller");
const updateBroker = require("./update/update.broker.controller");


const brokerController = {
    create: createBroker,
    getAll: getAllBroker,
    getBrokerTypeList: getAllBrokerTypeList,
    getBrokerCategoryList: getBrokerCategoryList,
    getById: getBrokerById,
    delete: deleteBroker,
    update: updateBroker
}

module.exports = brokerController;