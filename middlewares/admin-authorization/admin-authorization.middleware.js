

const checkAdminAuthorization = (req, res, next) => {
    try {
        let user = req.user;
        if (user.role === 'admin') {
            next();
        }
        else {
            let error = new Error('Unauthorized User');
            error.status = 401;
            throw error;
        }
    }
    catch (err) {
        if (!err.message) err.message = 'Error while checking Authorization';
        if (!err.status) err.status = 401;
        throw err;
    }
}

module.exports = checkAdminAuthorization;