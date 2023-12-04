const Proposal = require("../../../models/proposal/proposal.model");

const getFinalOfferAmmount = (req, res, next) => {
    try {
        let Id = req.params.Id;
        if (!Id) throw new Error('Id not provided').status = 400;
        Proposal.findById(Id).select('previousFinalOfferAmmount -_id').then((data) => {
            if (!data) throw new Error('Proposal Not Found').status = 400;
            res.status(200).send(data);
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

module.exports = getFinalOfferAmmount;