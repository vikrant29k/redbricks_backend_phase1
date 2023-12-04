const { default: mongoose } = require('mongoose');
const Proposal = require('../../../models/proposal/proposal.model');

const accountSid = 'AC8d9dfae2559ffaec05c38053d6366758';
const auth = '538195922a3f371f388e65bda555458f';

const twillio = require('twilio')(accountSid, auth);

const sendOtp = (req, res, next) => {
    // console.log('otp send::');
    let mobileNo = req.body.mobileNo;
    let Id = req.params.Id;
    let otp = 0;

    if (!mobileNo) {
        let error = new Error('Mobile No Not provided!');
        throw error;
    }

    try {
        while (!(otp >= 100000 && otp <= 999999)) {
            otp = Math.floor(Math.random() * 1000000);
        }
    }
    catch (err) {
        if (!err.message) err.message = 'Error While generating OTP';
        if (!err.status) err.status = 400;
        throw err;
    }

    twillio.messages.create({
        body: '012864 is your OTP for Proposal ID #2lkfj9diajf20q394rufoidfj to De-Register Broker',
        from: '+16292769821',
        to: mobileNo
    }).then((message) => {
        // console.log(message);
        Proposal.updateOne({ _id: Id }, { $set: { OTP: otp } }).then((result) => {
            res.status(200).send({
                "Message": "OTP Send Successfully"
            })
        }).catch((err) => {
            if (!err.message) err.message = 'Error while Generation OTP';
            throw err;
        })
    }).catch((err) => {
        if (!err.message) err.message = 'Error while Generating OTP';
        // console.log(err);
        next(err);
    })
}

module.exports = sendOtp;