const loginController = require('../../controllers/auth/login.auth.controller');
const logoutController = require('../../controllers/auth/logout.auth.controller');

const authRoute = require('express').Router();

authRoute.post('/login',loginController.checkUserStatus, loginController.forceLogin, loginController.login);

authRoute.get('/logout',logoutController.logout);


module.exports = authRoute;