const User = require("../../../models/user/user.model");
const bcrypt = require('bcrypt');

const createUser = (req, res, next) => {
    let data = req.body;
    User.findOne({ 'userName': data.userName }).then((user) => {
        if (user) {
            let error = new Error('User Already Exist with given Username');
            error.status = 406;
            throw error;
        }
        else {
            bcrypt.hash(data.password, 10, async (err, encrypted) => {
                try {
                    if (err) {
                        err.message = 'Something went wrong while hashing the password!';
                        if (!err.status) err.status = 503;
                        throw err;
                    }
                    else {
                        data.password = encrypted;
                        const user = new User(data);
                        user.save().then((user) => {
                            if (user) {
                                res.status(202).send({
                                    "Message": "User Added Successfully"
                                })
                            }
                            else {
                                let error = new Error('Error while creating user');
                                error.status = 500;
                                throw error;
                            }
                        }).catch((err) => {
                            if (!err.message) err.message = 'Error while creating user';
                            if (!err.status) err.status = 400;
                            next(err);
                        })
                    }
                }
                catch (err) {
                    if (!err.message) err.message = 'Error while creating user';
                    if (!err.status) err.status = 400;
                    next(err);
                }
            })
        }
    }).catch((err) => {
        if (!err.message) err.message = 'Error while creating user';
        if (!err.status) err.status = 400;
        next(err);
    })

}

module.exports = createUser;