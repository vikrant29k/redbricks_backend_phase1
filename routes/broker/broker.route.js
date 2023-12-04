const brokerController = require('../../controllers/broker/main.borker.controller');

const brokerRoute = require('express').Router();

brokerRoute.post('/create', brokerController.create);

brokerRoute.put('/update/:Id',brokerController.update);

brokerRoute.get('/getAll', brokerController.getAll);

brokerRoute.get('/getById/:Id', brokerController.getById);

brokerRoute.get('/getBrokerList', brokerController.getBrokerTypeList);

brokerRoute.get('/getBrokerCategoryList/:brokerType', brokerController.getBrokerCategoryList);

brokerRoute.delete('/delete/:Id',brokerController.delete);

module.exports = brokerRoute;