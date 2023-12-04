const Proposal = require("../../../models/proposal/proposal.model");

const resolveConflict = (req, res, next) => {
    try {
        let Id = req.params.Id;
        if (!Id) throw new Error('Id not provided').status = 400;
        Proposal.updateOne({ _id: Id }, { $set: { status: 'Conflict Resolved' } }).then((updateData) => {
            if (updateData.acknowledged && updateData.modifiedCount > 0) {
                res.status(200).send({
                    "Message": "Conflict Resolved"
                })
            }
            else throw new Error('Something went wrong').status = 400;
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

module.exports = resolveConflict;