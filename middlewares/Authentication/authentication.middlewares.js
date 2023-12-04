const jwt = require('jsonwebtoken');
const User = require('../../models/user/user.model');

const authentication = (req,res,next) => {
    try{
        // let token = req.headers?.['auth-token'];
        let token = req.headers?.['token'];
        if (!token) {
            console.log(token)
            let error = new Error('Authontication Header not set!',);
            error.status = 401;
            throw error;
        }
        // let deviceType = req.headers.devicetype;
        // if (!deviceType) {
        //     let error = new Error('devictype header not set!');
        //     error.status = 406;
        //     throw error;
        // }
        let decode = jwt.verify(token, process.env.AUTH_TOKEN_SECRET);
        // let decode = jwt.verify(token, 'sdfkajsdfwf384*&^*^');
        if(decode) {
            User.findOne({'userName': decode.userName }).then((user) => {
                if(user) {
                    // console.log(user,"USER")
                    // if (user.activeDevice === deviceType) {
                        if(user.salesHead) decode.salesHead = user.salesHead
                        req.user = decode;
                        next();
                    // }
                    // else {
                        // let error = new Error('Device is no longer Authenticated');
                        // error.status = 401;
                        // throw error;
                    // }
                }
            }).catch((err) => {
                if (!err.status) err.status = 400;
                if (!err.message) err.message = 'Something went wrong during authintication!';
                next(err);
            })
        }
        else {
            let error = new Error('Invalid auth key');
            error.status = 401;
            throw error;
        }
    }
    catch (err) {
        if (!err.status) err.status = 401;
        if (!err.message) err.message = 'Authentication Failed';
        throw err;
    }
}

module.exports = authentication;