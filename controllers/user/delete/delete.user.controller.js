const mongoose = require("mongoose")
const User = require("../../../models/user/user.model");

const deleteUser = (req, res, next) => {
    let id = req.params.id;
    let isValidId = mongoose.isValidObjectId(id);
    if (isValidId === false) {
        let error = new Error('Please Provide a valid Id');
        error.status = 400;
        throw error;
    }
    User.findByIdAndDelete(mongoose.Types.ObjectId(id)).then((result) => {
        if (!result) {
            let error = new Error('No user Found with the Id Provided');
            error.status = 404;
            throw error;
        }
        else {
            res.status(202).send({
                "Message": "User Deleted Successfully!"
            })
        }
    }).catch((err) => {
        if (!err.message) err.message = 'Something went wrong while deleting user';
        if (!err.status) err.status = 400;
        next(err);
    })

}

module.exports = deleteUser;