const profileController = require('../../controllers/profile/main.profile.controller');

const profileRoute = require('express').Router();

profileRoute.get('/get', profileController.get);

profileRoute.post('/update', profileController.update);

module.exports = profileRoute;