const Broker = require("../../../models/broker/broker.model");

const getAllBrokerTypeList = (req, res, next) => {
    Broker.find().distinct('brokerType').then((brokerList) => {
        if (!brokerList) {
            let error = new Error('Something went wrong');
            throw error;
        }
        else {
            res.status(200).send(brokerList);
        }
    }).catch((err) => {
        if (!err.message) err.message = 'Something went wrong';
        return next(err);
    })
}

module.exports = getAllBrokerTypeList;