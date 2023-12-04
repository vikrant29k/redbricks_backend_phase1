const Cost = require("../../../models/cost/cost.model");

const getAllCosts= (req, res, next) => {
    Cost.find().then((costData) => {
        // console.log(costData)
        if (!costData) {
            let error = new Error('Something went wrong');
            throw error;
        }
        else {
            res.status(200).send(costData);
        }
    }).catch((err) => {
        if (!err.message) err.message = 'Something went wrong';
        if (!err.status) err.status = 400;
        return next(err);
    })
}

module.exports = getAllCosts;