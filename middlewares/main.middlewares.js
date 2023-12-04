const checkAdminAuthorization = require('./admin-authorization/admin-authorization.middleware');
const authentication = require('./Authentication/authentication.middlewares');


const middleware = {
    authentication: authentication,
    checkAdminAuthorization: checkAdminAuthorization
}

module.exports = middleware;