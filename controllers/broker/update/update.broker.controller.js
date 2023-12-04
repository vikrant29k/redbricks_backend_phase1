const { default: mongoose } = require("mongoose");
const Broker = require("../../../models/broker/broker.model");

const updateBroker = (req, res, next) => {
    try {
        let brokerId = req.params.Id;
        let data = req.body;
        if (!brokerId) throw new Error('Id not provided');
        Broker.updateOne({ _id: mongoose.Types.ObjectId(brokerId) }, { $set: data }).then((updateResult) => {
            if (updateResult.acknowledged && updateResult.modifiedCount > 0) {
                res.status(202).send({
                    "Message": "Broker data updated"
                })
            }
            else throw new Error('Something went wrong');
        }).catch((err) => {
            if (!err.message) err.message = 'Something went wrong';
            return next(err);
        })
    }
    catch (err) {
        if (!err.message) err.message = 'Something went wrong';
        if (!err.status) err.status = 400;
        throw err;
    }
}

module.exports = updateBroker;