const { default: mongoose } = require("mongoose");
const Proposal = require("../../../models/proposal/proposal.model");

const verifyOtp = (req, res, next) => {
    let otp = req.body.otp;
    let Id = req.params.Id;
    Proposal.findById(Id).then((proposal) => {
        if (!proposal) {
            let error = new Error('Cannot find any proposal with given ID');
            error.status = 404;
            throw error;
        }
        else {
            if (proposal.OTP === Number(otp)) {
                res.status(200).send({
                    "Message": "OTP verified Successfully"
                })
            }
            else {
                let error = new Error('Invalid OTP');
                error.status = 401;
                throw error;
            }
        }
    }).catch((err) => {
        if (!err.message) err.message = 'Error while verifing OTP';
        next(err);
    })
}

module.exports = verifyOtp;