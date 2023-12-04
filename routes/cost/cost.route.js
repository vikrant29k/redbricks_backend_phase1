const costController = require('../../controllers/cost/main.cost.controller');

const costRoute = require('express').Router();

costRoute.get('/getAll',costController.getAll);
costRoute.post('/update',costController.update);


module.exports = costRoute;