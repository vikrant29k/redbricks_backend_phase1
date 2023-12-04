const LogController = require('../../controllers/log/main.log.controller');

const logsRoute = require('express').Router();

logsRoute.get('/proposal-log', LogController.proposal.getAll);

module.exports = logsRoute;