const User = require("../../../models/user/user.model")


const getSalesHead = (req, res, next) => {
    User.find().select('firstName lastName').where('role').equals('sales head').then((salesHeads) => {
        if (!salesHeads) {
            let error = new Error('Error while finding sales heads');
            error.status = 503;
            throw error;
        }
        else {
            res.status(200).send(salesHeads);
        }
    }).catch((err) => {
        if (!err.message) err.message = 'Error while finding sales heads';
        if (!err.status) err.status = 503;
        next(err);
    })
}

module.exports = getSalesHead;