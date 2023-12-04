const { default: mongoose } = require("mongoose");
const Broker = require("../../../models/broker/broker.model");

const deleteBroker = (req, res, next) => {
    try {
        let brokerId = req.params.Id;
        if (!brokerId) throw new Error('Id not Provided');
        Broker.deleteOne({ _id: mongoose.Types.ObjectId(brokerId) }).then((deleteResult) => {
            if (deleteResult.acknowledged && deleteResult.deletedCount > 0) {
                res.status(202).send({
                    "Message": "Broker deleted Successfully"
                })
            }
            else throw new Error('Something went wrong');
        })
    }
    catch (err) {
        if (!err.message) err.message = 'Something went wrong';
        if (!err.status) err.status = 400;
        throw err;
    }
}

module.exports = deleteBroker;