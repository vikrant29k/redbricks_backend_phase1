const layoutController = require('../../controllers/locked seats/main.lockedSeats.controller');

const layoutDataRoute = require('express').Router();

layoutDataRoute.get('/viewSingleProposal/:Id/:selectFrom', layoutController.viewSingleProposal);
layoutDataRoute.get('/viewLayout/:Id', layoutController.viewLayout);
layoutDataRoute.delete('/deleteProposal/:Id',layoutController.delete)
module.exports = layoutDataRoute;