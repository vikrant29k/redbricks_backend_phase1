const Proposal = require("../../../models/proposal/proposal.model");

const updateFinalOfferAmmount = (req, res, next) => {
    try {
        let Id = req.params.Id;
        let data = req.body;
        // console.log("Data Final offer amount",data)
        let currntUser = req.user;
        if (!Id) throw new Error('Id not provided').status = 400;
        Proposal.findById(Id).then((proposal) => {
            // console.log("proposal Final offer amount:",proposal)
            Proposal.updateOne({ _id: proposal._id }, { $set: { previousFinalOfferAmmount: proposal.finalOfferAmmount || data.finalOfferAmmount, clientFinalOfferAmmount: data.clientFinalOfferAmmount || proposal.finalOfferAmmount, escalateForCloser: true, status: 'Completed but not approved' } }).then((updateData) => {
                if (updateData.acknowledged && updateData.modifiedCount > 0) {
                    res.status(202).send({
                        "Message": "Final offer ammount updated and esclated for closure"
                    })
                }
                else throw new Error('Something went wrong').status = 400;
            }).catch((err) => {
                if (!err.message) err.message = 'Something went wrong';
                if (!err.status) err.status = 400;
                return next(err);
            })
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

module.exports = updateFinalOfferAmmount;