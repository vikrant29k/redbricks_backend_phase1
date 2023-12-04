const { default: mongoose } = require("mongoose");
const User = require("../../../models/user/user.model");


const getProfile = (req, res, next) => {
    try {
        let Id = req.user._id;
        if (!Id) {
            let error = new Error('Unauthorized user');
            error.status = 401;
            throw error;
        }
        User.findById(mongoose.Types.ObjectId(Id)).then((user) => {
            if (!user) {
                let error = new Error('Invalid User ID');
                error.status = 400;
                throw error;
            }
            res.status(200).send(user);
        }).catch((err) => {
            if(!err.message) err.message = 'Error while retriving user data.'
            if (!err.status) err.status = 400;
            next(err);
        })
    }
    catch (err) {
        if (!err.message) err.message = 'Error while retriving user data.'
        if (!err.status) err.status = 400;
        throw err;
    }
    
}

module.exports = getProfile;