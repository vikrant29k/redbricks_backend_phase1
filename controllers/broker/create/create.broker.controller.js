const Broker = require("../../../models/broker/broker.model");

const createBroker = (req, res, next) => {
    let data = req.body;
    Broker.find().where('brokerType').equals(data.brokerType).where('brokerCategory').equals(data.brokerCategory).then((brokerList) => {
        if (brokerList.length > 0) {
            let error = new Error('Broker can\'t be added twice!');
            error.status = 406;
            throw error;
        }
        else {
            const broker = new Broker(data);
            broker.save().then(() => {
                res.status(202).send({
                    "Message": "Broker added successfully"
                })
            }).catch((err) => {
                if (!err.message) err.message = 'Something went wrong';
                return next(err);
            })
        }
    }).catch((err) => {
        if (!err.message) err.message = 'Something went wrong';
        if (!err.status) err.status = 400;
        return next(err);
    })
}

module.exports = createBroker;