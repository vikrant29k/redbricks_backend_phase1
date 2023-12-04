const { default: mongoose } = require("mongoose");
const Broker = require("../../../models/broker/broker.model");

const getBrokerById = (req, res, next) => {
    try {
        let brokerId = req.params.Id;
        Broker.findById(mongoose.Types.ObjectId(brokerId)).then((brokerData) => {
            if (!brokerData) throw new Error('Something went wrong');
            res.status(200).send(brokerData);
        }).catch((err) => {
            if (!err.message) err.message = 'Something went wrong';
            if (!err.status) err.status = 400;
            return next(err);
        })
    }
    catch (err) {
        if (!err.message) err.message = 'Something went wrong';
        if (!err.status) err.status = 400;
        throw err;
    }
}

module.exports = getBrokerById;