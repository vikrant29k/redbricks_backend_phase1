const Broker = require("../../../models/broker/broker.model");

const getBrokerCategoryList = (req, res, next) => {
    try {
        let brokerType = req.params.brokerType;
        if (!brokerType) throw new Error('Broker not selected');
        Broker.find().where('brokerType').equals(brokerType).distinct('brokerCategory').then((brokerCategoryList) => {
            if (!brokerCategoryList) throw new Error('Something went wrong');
            res.status(200).send(brokerCategoryList);
        })
    }
    catch (err) {
        if (!err.message) err.message = 'Something went wrong';
        err.status = 400;
        throw err;
    }
}

module.exports = getBrokerCategoryList;