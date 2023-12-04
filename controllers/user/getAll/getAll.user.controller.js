const { default: mongoose } = require("mongoose");
const User = require("../../../models/user/user.model");

const getAllUser = (req, res, next) => {
    try {
        let currentUser = req.user;
        // console.log(currentUser);

        const getUserQuery = () => {
            if (currentUser.role === 'admin') {
                return User.find().nor([{ _id: mongoose.Types.ObjectId(currentUser._id) }]);
            }
            else if (currentUser.role === 'sales head') {
                return User.find().nor([{ _id: mongoose.Types.ObjectId(currentUser._id) }]).where('role').equals('sales').where('salesHead').equals(currentUser._id);
            }
        }
        getUserQuery().then((allUser) => {
            if (allUser) {
                res.status(200).send(allUser);
            }
            else {
                let error = new Error('Something went wrong while getting all users');
                throw error;
            }
        }).catch((err) => {
            if (!err.status) {
                err.status = 400;
            }
            next(err);
        })
    }
    catch (err) {
        if (!err.status) {
            err.status = 400;
        }
        throw err;
    }
}

module.exports = getAllUser;