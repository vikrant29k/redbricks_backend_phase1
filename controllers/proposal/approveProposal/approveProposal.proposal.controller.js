const Proposal = require("../../../models/proposal/proposal.model");
const Location = require("../../../models/location/location.model");
const LogController = require('../../../models/proposal-log/proposal-log.model')
const approveClouser = (req, res, next) => {
    try {
        let Id = req.params.Id;
        let currentUser = req.user;
        // console.log(currentUser);
        let data = req.body;
       
        if (!Id) throw new Error('Id not Provided').status = 400;
        if (currentUser.role === 'sales head') {
            Proposal.findById(Id).then((proposal) => {
                Proposal.updateOne({ _id: proposal._id }, { $set: {salesHeadFinalOfferAmmount:data.salesHeadFinalOfferAmmount, finalOfferAmmount: data.finalOfferAmmount || proposal.clientFinalOfferAmmount || proposal.previousFinalOfferAmmount, status: 'Completed and approved', lockedProposal:false } }).then((updateResult) => {
                LogController.findOneAndUpdate({proposalId: proposal._id}, {$set:{'price':data.salesHeadFinalOfferAmmount}}).then(result=>{
                    // console.log(result)
                }).catch((err) => {

                    console.error('Error while updating Log data:', err);
                  });

                    if (updateResult.acknowledged && updateResult.modifiedCount > 0) {
                    req.locationData = {
                            address: proposal.address
                        }
                        next();
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
        else throw new Error('Unauthorized user').status = 401;
    }
    catch (err) {
        if (!err.message) err.message = 'Something went wrong';
        if (!err.status) err.status = 400;
        throw err;
    }
}

module.exports = approveClouser;